const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const authenticateUser = require('../middleware/auth');

const router = express.Router();

const USER_PUBLIC_FIELDS = `
    id, name, identifier, protein_goal, carbs_goal, fat_goal, calories_goal,
    current_weight, target_weight, created_at, updated_at
`;

router.get('/profile', authenticateUser, async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT ${USER_PUBLIC_FIELDS} FROM users WHERE id = $1`,
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        next(err);
    }
});

router.put(
    '/profile',
    authenticateUser,
    [
        body('name').trim().notEmpty().withMessage('الاسم مطلوب').isLength({ max: 150 }),
        body('identifier').trim().notEmpty().withMessage('البريد الإلكتروني أو رقم الجوال مطلوب')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            }

            const { name, identifier } = req.body;

            const existing = await pool.query(
                'SELECT id FROM users WHERE identifier = $1 AND id != $2',
                [identifier, req.userId]
            );
            if (existing.rows.length > 0) {
                return res.status(409).json({ message: 'البريد أو رقم الجوال مستخدم بالفعل' });
            }

            const result = await pool.query(
                `UPDATE users SET name = $1, identifier = $2, updated_at = NOW()
                 WHERE id = $3 RETURNING ${USER_PUBLIC_FIELDS}`,
                [name, identifier, req.userId]
            );

            res.json({ message: 'تم تحديث الملف الشخصي بنجاح', user: result.rows[0] });
        } catch (err) {
            next(err);
        }
    }
);

router.put(
    '/goals',
    authenticateUser,
    [
        body('proteinGoal').isFloat({ min: 0 }).withMessage('هدف البروتين غير صالح'),
        body('carbsGoal').isFloat({ min: 0 }).withMessage('هدف الكارب غير صالح'),
        body('fatGoal').isFloat({ min: 0 }).withMessage('هدف الدهون غير صالح'),
        body('caloriesGoal').isFloat({ min: 0 }).withMessage('هدف السعرات غير صالح'),
        body('targetWeight').isFloat({ min: 0 }).withMessage('الوزن المستهدف غير صالح')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            }

            const { proteinGoal, carbsGoal, fatGoal, caloriesGoal, targetWeight } = req.body;

            const result = await pool.query(
                `UPDATE users SET
                    protein_goal = $1, carbs_goal = $2, fat_goal = $3,
                    calories_goal = $4, target_weight = $5, updated_at = NOW()
                 WHERE id = $6 RETURNING ${USER_PUBLIC_FIELDS}`,
                [proteinGoal, carbsGoal, fatGoal, caloriesGoal, targetWeight, req.userId]
            );

            res.json({ message: 'تم تحديث الأهداف بنجاح', user: result.rows[0] });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
