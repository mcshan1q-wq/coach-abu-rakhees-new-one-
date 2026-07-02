const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const authenticateUser = require('../middleware/auth');

const router = express.Router();

const MEAL_TYPES = ['فطور', 'غداء', 'عشاء', 'سناك', 'أخرى'];

router.get('/today', authenticateUser, async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT * FROM meals
             WHERE user_id = $1 AND created_at::date = NOW()::date
             ORDER BY created_at DESC`,
            [req.userId]
        );

        const meals = result.rows;
        const totals = meals.reduce(
            (acc, meal) => {
                acc.protein += Number(meal.protein);
                acc.carbs += Number(meal.carbs);
                acc.fat += Number(meal.fat);
                acc.calories += Number(meal.calories);
                return acc;
            },
            { protein: 0, carbs: 0, fat: 0, calories: 0 }
        );

        const userResult = await pool.query(
            'SELECT protein_goal, carbs_goal, fat_goal, calories_goal FROM users WHERE id = $1',
            [req.userId]
        );
        const goals = userResult.rows[0];

        res.json({
            meals,
            totals,
            goals,
            remaining: {
                protein: Math.max(Number(goals.protein_goal) - totals.protein, 0),
                carbs: Math.max(Number(goals.carbs_goal) - totals.carbs, 0),
                fat: Math.max(Number(goals.fat_goal) - totals.fat, 0),
                calories: Math.max(Number(goals.calories_goal) - totals.calories, 0)
            }
        });
    } catch (err) {
        next(err);
    }
});

router.get('/', authenticateUser, async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM meals WHERE user_id = $1 ORDER BY created_at DESC',
            [req.userId]
        );
        res.json({ meals: result.rows });
    } catch (err) {
        next(err);
    }
});

router.post(
    '/',
    authenticateUser,
    [
        body('mealType').isIn(MEAL_TYPES).withMessage('نوع الوجبة غير صالح'),
        body('mealName').trim().notEmpty().withMessage('اسم الوجبة مطلوب').isLength({ max: 150 }),
        body('protein').isFloat({ min: 0 }).withMessage('قيمة البروتين غير صالحة'),
        body('carbs').isFloat({ min: 0 }).withMessage('قيمة الكارب غير صالحة'),
        body('fat').isFloat({ min: 0 }).withMessage('قيمة الدهون غير صالحة'),
        body('calories').isFloat({ min: 0 }).withMessage('قيمة السعرات غير صالحة'),
        body('notes').optional({ nullable: true }).isString().isLength({ max: 1000 })
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            }

            const { mealType, mealName, protein, carbs, fat, calories, notes } = req.body;

            const result = await pool.query(
                `INSERT INTO meals (user_id, meal_type, meal_name, protein, carbs, fat, calories, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [req.userId, mealType, mealName, protein, carbs, fat, calories, notes || null]
            );

            res.status(201).json({ message: 'تم إضافة الوجبة بنجاح', meal: result.rows[0] });
        } catch (err) {
            next(err);
        }
    }
);

router.put(
    '/:id',
    authenticateUser,
    [
        body('mealType').isIn(MEAL_TYPES).withMessage('نوع الوجبة غير صالح'),
        body('mealName').trim().notEmpty().withMessage('اسم الوجبة مطلوب').isLength({ max: 150 }),
        body('protein').isFloat({ min: 0 }).withMessage('قيمة البروتين غير صالحة'),
        body('carbs').isFloat({ min: 0 }).withMessage('قيمة الكارب غير صالحة'),
        body('fat').isFloat({ min: 0 }).withMessage('قيمة الدهون غير صالحة'),
        body('calories').isFloat({ min: 0 }).withMessage('قيمة السعرات غير صالحة'),
        body('notes').optional({ nullable: true }).isString().isLength({ max: 1000 })
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            }

            const { id } = req.params;
            const { mealType, mealName, protein, carbs, fat, calories, notes } = req.body;

            const existing = await pool.query('SELECT id FROM meals WHERE id = $1 AND user_id = $2', [id, req.userId]);
            if (existing.rows.length === 0) {
                return res.status(404).json({ message: 'الوجبة غير موجودة' });
            }

            const result = await pool.query(
                `UPDATE meals SET
                    meal_type = $1, meal_name = $2, protein = $3, carbs = $4,
                    fat = $5, calories = $6, notes = $7, updated_at = NOW()
                 WHERE id = $8 AND user_id = $9
                 RETURNING *`,
                [mealType, mealName, protein, carbs, fat, calories, notes || null, id, req.userId]
            );

            res.json({ message: 'تم تحديث الوجبة بنجاح', meal: result.rows[0] });
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/:id', authenticateUser, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM meals WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'الوجبة غير موجودة' });
        }

        res.json({ message: 'تم حذف الوجبة بنجاح' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
