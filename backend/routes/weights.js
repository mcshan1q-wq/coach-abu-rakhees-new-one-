const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const authenticateUser = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticateUser, async (req, res, next) => {
    try {
        const userResult = await pool.query(
            'SELECT target_weight FROM users WHERE id = $1',
            [req.userId]
        );
        const targetWeight = Number(userResult.rows[0].target_weight);

        const latestResult = await pool.query(
            'SELECT weight, created_at FROM weights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [req.userId]
        );
        const latest = latestResult.rows[0] || null;

        const weekAgoResult = await pool.query(
            `SELECT weight FROM weights
             WHERE user_id = $1 AND created_at <= NOW() - INTERVAL '7 days'
             ORDER BY created_at DESC LIMIT 1`,
            [req.userId]
        );

        const monthAgoResult = await pool.query(
            `SELECT weight FROM weights
             WHERE user_id = $1 AND created_at <= NOW() - INTERVAL '30 days'
             ORDER BY created_at DESC LIMIT 1`,
            [req.userId]
        );

        const latestWeight = latest ? Number(latest.weight) : null;
        const weeklyChange = latest && weekAgoResult.rows[0]
            ? latestWeight - Number(weekAgoResult.rows[0].weight)
            : null;
        const monthlyChange = latest && monthAgoResult.rows[0]
            ? latestWeight - Number(monthAgoResult.rows[0].weight)
            : null;

        const chartResult = await pool.query(
            'SELECT weight, created_at FROM weights WHERE user_id = $1 ORDER BY created_at ASC',
            [req.userId]
        );

        res.json({
            latestWeight,
            targetWeight,
            difference: latestWeight !== null ? Number((latestWeight - targetWeight).toFixed(2)) : null,
            weeklyChange: weeklyChange !== null ? Number(weeklyChange.toFixed(2)) : null,
            monthlyChange: monthlyChange !== null ? Number(monthlyChange.toFixed(2)) : null,
            chart: chartResult.rows
        });
    } catch (err) {
        next(err);
    }
});

router.get('/', authenticateUser, async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM weights WHERE user_id = $1 ORDER BY created_at DESC',
            [req.userId]
        );
        res.json({ weights: result.rows });
    } catch (err) {
        next(err);
    }
});

router.post(
    '/',
    authenticateUser,
    [
        body('weight').isFloat({ min: 0 }).withMessage('الوزن غير صالح'),
        body('notes').optional({ nullable: true }).isString().isLength({ max: 1000 })
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            }

            const { weight, notes } = req.body;

            const result = await pool.query(
                `INSERT INTO weights (user_id, weight, notes)
                 VALUES ($1, $2, $3) RETURNING *`,
                [req.userId, weight, notes || null]
            );

            await pool.query(
                'UPDATE users SET current_weight = $1, updated_at = NOW() WHERE id = $2',
                [weight, req.userId]
            );

            res.status(201).json({ message: 'تم تسجيل الوزن بنجاح', weightEntry: result.rows[0] });
        } catch (err) {
            next(err);
        }
    }
);

router.put(
    '/:id',
    authenticateUser,
    [
        body('weight').isFloat({ min: 0 }).withMessage('الوزن غير صالح'),
        body('notes').optional({ nullable: true }).isString().isLength({ max: 1000 })
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            }

            const { id } = req.params;
            const { weight, notes } = req.body;

            const existing = await pool.query('SELECT id FROM weights WHERE id = $1 AND user_id = $2', [id, req.userId]);
            if (existing.rows.length === 0) {
                return res.status(404).json({ message: 'سجل الوزن غير موجود' });
            }

            const result = await pool.query(
                `UPDATE weights SET weight = $1, notes = $2, updated_at = NOW()
                 WHERE id = $3 AND user_id = $4 RETURNING *`,
                [weight, notes || null, id, req.userId]
            );

            const latestResult = await pool.query(
                'SELECT weight FROM weights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
                [req.userId]
            );
            if (latestResult.rows.length > 0) {
                await pool.query(
                    'UPDATE users SET current_weight = $1, updated_at = NOW() WHERE id = $2',
                    [latestResult.rows[0].weight, req.userId]
                );
            }

            res.json({ message: 'تم تحديث سجل الوزن بنجاح', weightEntry: result.rows[0] });
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/:id', authenticateUser, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM weights WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'سجل الوزن غير موجود' });
        }

        const latestResult = await pool.query(
            'SELECT weight FROM weights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [req.userId]
        );
        if (latestResult.rows.length > 0) {
            await pool.query(
                'UPDATE users SET current_weight = $1, updated_at = NOW() WHERE id = $2',
                [latestResult.rows[0].weight, req.userId]
            );
        }

        res.json({ message: 'تم حذف سجل الوزن بنجاح' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
