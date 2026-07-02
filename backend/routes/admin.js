const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { signAdminToken } = require('../utils/jwt');
const authenticateAdmin = require('../middleware/adminAuth');

const router = express.Router();

router.post(
    '/login',
    [
        body('username').trim().notEmpty().withMessage('اسم المستخدم مطلوب'),
        body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
    ],
    (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            }

            const { username, password } = req.body;

            if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
                return res.status(401).json({ message: 'بيانات دخول الأدمن غير صحيحة' });
            }

            const token = signAdminToken();
            res.json({ message: 'تم تسجيل دخول الأدمن بنجاح', token });
        } catch (err) {
            next(err);
        }
    }
);

router.get('/stats', authenticateAdmin, async (req, res, next) => {
    try {
        const usersCount = await pool.query('SELECT COUNT(*)::int AS count FROM users');
        const mealsCount = await pool.query('SELECT COUNT(*)::int AS count FROM meals');
        const weightsCount = await pool.query('SELECT COUNT(*)::int AS count FROM weights');

        res.json({
            usersCount: usersCount.rows[0].count,
            mealsCount: mealsCount.rows[0].count,
            weightsCount: weightsCount.rows[0].count
        });
    } catch (err) {
        next(err);
    }
});

router.get('/users', authenticateAdmin, async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id, u.name, u.identifier, u.current_weight, u.target_weight, u.created_at,
                COUNT(DISTINCT m.id)::int AS meals_count,
                (
                    SELECT w.weight FROM weights w
                    WHERE w.user_id = u.id
                    ORDER BY w.created_at DESC LIMIT 1
                ) AS last_weight
            FROM users u
            LEFT JOIN meals m ON m.user_id = u.id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);

        res.json({ users: result.rows });
    } catch (err) {
        next(err);
    }
});

router.get('/users/:id', authenticateAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;

        const userResult = await pool.query(
            `SELECT id, name, identifier, protein_goal, carbs_goal, fat_goal, calories_goal,
                    current_weight, target_weight, created_at, updated_at
             FROM users WHERE id = $1`,
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        const mealsResult = await pool.query(
            'SELECT * FROM meals WHERE user_id = $1 ORDER BY created_at DESC',
            [id]
        );

        const weightsResult = await pool.query(
            'SELECT * FROM weights WHERE user_id = $1 ORDER BY created_at DESC',
            [id]
        );

        res.json({
            user: userResult.rows[0],
            meals: mealsResult.rows,
            weights: weightsResult.rows
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/users/:id', authenticateAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        res.json({ message: 'تم حذف المستخدم بنجاح' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
