const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { signUserToken } = require('../utils/jwt');
const authenticateUser = require('../middleware/auth');

const router = express.Router();

const USER_PUBLIC_FIELDS = `
    id, name, identifier, protein_goal, carbs_goal, fat_goal, calories_goal,
    current_weight, target_weight, created_at, updated_at
`;

router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('الاسم مطلوب').isLength({ max: 150 }),
        body('identifier').trim().notEmpty().withMessage('البريد الإلكتروني أو رقم الجوال مطلوب'),
        body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('كلمة المرور وتأكيدها غير متطابقين');
            }
            return true;
        }),
        body('currentWeight').isFloat({ min: 0 }).withMessage('الوزن الحالي غير صالح'),
        body('targetWeight').isFloat({ min: 0 }).withMessage('الوزن المستهدف غير صالح'),
        body('proteinGoal').isFloat({ min: 0 }).withMessage('هدف البروتين غير صالح'),
        body('carbsGoal').isFloat({ min: 0 }).withMessage('هدف الكارب غير صالح'),
        body('fatGoal').isFloat({ min: 0 }).withMessage('هدف الدهون غير صالح'),
        body('caloriesGoal').isFloat({ min: 0 }).withMessage('هدف السعرات غير صالح')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            }

            const {
                name, identifier, password,
                currentWeight, targetWeight,
                proteinGoal, carbsGoal, fatGoal, caloriesGoal
            } = req.body;

            const existing = await pool.query('SELECT id FROM users WHERE identifier = $1', [identifier]);
            if (existing.rows.length > 0) {
                return res.status(409).json({ message: 'يوجد حساب مسجل بهذا البريد أو رقم الجوال بالفعل' });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const result = await pool.query(
                `INSERT INTO users
                    (name, identifier, password_hash, protein_goal, carbs_goal, fat_goal, calories_goal, current_weight, target_weight)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING ${USER_PUBLIC_FIELDS}`,
                [name, identifier, passwordHash, proteinGoal, carbsGoal, fatGoal, caloriesGoal, currentWeight, targetWeight]
            );

            const user = result.rows[0];
            const token = signUserToken(user);

            res.status(201).json({ message: 'تم إنشاء الحساب بنجاح', token, user });
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    '/login',
    [
        body('identifier').trim().notEmpty().withMessage('البريد الإلكتروني أو رقم الجوال مطلوب'),
        body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            }

            const { identifier, password } = req.body;

            const result = await pool.query('SELECT * FROM users WHERE identifier = $1', [identifier]);
            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
            }

            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
            }

            delete user.password_hash;
            const token = signUserToken(user);

            res.json({ message: 'تم تسجيل الدخول بنجاح', token, user });
        } catch (err) {
            next(err);
        }
    }
);

router.get('/me', authenticateUser, async (req, res, next) => {
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

module.exports = router;
