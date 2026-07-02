const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { GoogleGenAI } = require('@google/genai');
const authenticateUser = require('../middleware/auth');

const router = express.Router();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'عدد كبير جدًا من طلبات الذكاء الاصطناعي، يرجى المحاولة لاحقًا' }
});

const MEAL_SCHEMA = {
    type: 'object',
    properties: {
        mealName: { type: 'string', description: 'اسم مختصر للوجبة بالعربية' },
        protein: { type: 'number', description: 'البروتين بالجرام' },
        carbs: { type: 'number', description: 'الكاربوهيدرات بالجرام' },
        fat: { type: 'number', description: 'الدهون بالجرام' },
        calories: { type: 'number', description: 'السعرات الحرارية' }
    },
    required: ['mealName', 'protein', 'carbs', 'fat', 'calories']
};

router.post(
    '/analyze-meal',
    aiLimiter,
    authenticateUser,
    [
        body('description').trim().notEmpty().withMessage('وصف الوجبة مطلوب').isLength({ max: 500 })
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            }

            const { description } = req.body;

            const response = await genAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `أنت خبير تغذية. يصف المستخدم وجبة بالعربية (قد تتضمن كميات بالجرام أو وحدات منزلية). قدّر بأفضل معرفتك القيم الغذائية التقريبية للوجبة كاملة.\n\nالوجبة: ${description}`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: MEAL_SCHEMA
                }
            });

            if (!response.text) {
                return res.status(502).json({ message: 'تعذر تحليل الوجبة، حاول صياغة الوصف بشكل مختلف' });
            }

            const macros = JSON.parse(response.text);
            res.json({ macros });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
