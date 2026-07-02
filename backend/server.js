require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const mealsRoutes = require('./routes/meals');
const weightsRoutes = require('./routes/weights');
const adminRoutes = require('./routes/admin');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'].filter(Boolean);

app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('غير مسموح بالوصول من هذا المصدر (CORS)'));
        },
        credentials: true
    })
);
app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'عدد كبير جدًا من الطلبات، يرجى المحاولة لاحقًا' }
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'عدد كبير جدًا من محاولات الدخول، يرجى المحاولة لاحقًا' }
});
app.use('/api/auth', authLimiter);
app.use('/api/admin/login', authLimiter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'الكوتش أبو رخيص - السيرفر يعمل بنجاح' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/weights', weightsRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🏋️  سيرفر الكوتش أبو رخيص يعمل على المنفذ ${PORT}`);
});
