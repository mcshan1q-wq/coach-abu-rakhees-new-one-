# الكوتش أبو رخيص 🏋️

منصة عربية متكاملة لتتبع الصحة، التغذية، الماكروز، السعرات اليومية، والوزن. تصميم رياضي احترافي (أبيض وأسود)، RTL بالكامل، ومتجاوب مع الكمبيوتر والجوال والأجهزة اللوحية.

## المحتويات

- [نظرة عامة](#نظرة-عامة)
- [التقنيات المستخدمة](#التقنيات-المستخدمة)
- [هيكل المشروع](#هيكل-المشروع)
- [التشغيل المحلي](#التشغيل-المحلي)
- [إعداد قاعدة بيانات Neon](#إعداد-قاعدة-بيانات-neon)
- [نشر Backend على Render](#نشر-backend-على-render)
- [نشر Frontend على Vercel](#نشر-frontend-على-vercel)
- [متغيرات البيئة](#متغيرات-البيئة)
- [رفع المشروع إلى GitHub](#رفع-المشروع-إلى-github)
- [بيانات دخول الأدمن](#بيانات-دخول-الأدمن)

## نظرة عامة

يتيح الموقع للمستخدم:

- إنشاء حساب وتسجيل الدخول (JWT + bcryptjs)
- تحديد أهداف يومية: البروتين، الكارب، الدهون، السعرات، والوزن المستهدف
- تسجيل الوجبات (فطور، غداء، عشاء، سناك، أخرى) مع حساب الماكروز
- متابعة ملخص اليوم عبر Progress Bars
- تتبع الوزن يوميًا مع رسم بياني (Chart.js) وإحصائيات (المعدل الأسبوعي/الشهري)
- تعديل الملف الشخصي والأهداف
- لوحة تحكم أدمن مستقلة على `/admin` لإدارة المستخدمين

## التقنيات المستخدمة

**Frontend:** React, Vite, React Router, Axios, Chart.js, CSS حديث
**Backend:** Node.js, Express.js
**Database:** PostgreSQL (Neon)
**Auth:** JWT, bcryptjs
**الأمان:** helmet, cors, express-rate-limit, express-validator
**النشر:** Vercel (Frontend) + Render (Backend) + Neon (Database)

## هيكل المشروع

```
coach-abu-rakhees/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── db.js
│   ├── schema.sql
│   ├── .env.example
│   ├── .gitignore
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── adminAuth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── meals.js
│   │   ├── weights.js
│   │   └── admin.js
│   └── utils/
│       └── jwt.js
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    ├── .gitignore
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── styles.css
        ├── components/
        ├── pages/
        ├── layouts/
        ├── hooks/
        ├── services/
        └── utils/
```

## التشغيل المحلي

### المتطلبات

- Node.js 18 أو أحدث
- حساب Neon (أو أي قاعدة PostgreSQL) للحصول على `DATABASE_URL`

### 1. Backend

```bash
cd backend
cp .env.example .env
# عدّل قيم .env: DATABASE_URL, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, FRONTEND_URL

npm install

# لإنشاء الجداول في قاعدة البيانات (مرة واحدة فقط):
psql "$DATABASE_URL" -f schema.sql

npm run dev
```

يعمل السيرفر افتراضيًا على: `http://localhost:5000`
تحقق من عمله عبر: `http://localhost:5000/api/health`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# تأكد أن VITE_API_URL يشير إلى http://localhost:5000/api

npm install
npm run dev
```

يعمل الموقع افتراضيًا على: `http://localhost:5173`

## إعداد قاعدة بيانات Neon

1. أنشئ حسابًا على [neon.tech](https://neon.tech)
2. أنشئ مشروعًا جديدًا (Project) واختر منطقة قريبة
3. من لوحة التحكم، انسخ **Connection String** (يبدأ بـ `postgresql://`)
4. ضع القيمة في `backend/.env` تحت `DATABASE_URL`
5. نفّذ ملف `schema.sql` على قاعدة البيانات لإنشاء الجداول:
   ```bash
   psql "$DATABASE_URL" -f backend/schema.sql
   ```
   أو الصق محتوى الملف داخل SQL Editor في لوحة Neon.

## نشر Backend على Render

1. ارفع المشروع إلى GitHub (راجع القسم أدناه)
2. من [render.com](https://render.com) أنشئ **New Web Service** واربطه بمستودع GitHub
3. اضبط الإعدادات:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. أضف متغيرات البيئة التالية في قسم Environment:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_USERNAME=Mohammed`
   - `ADMIN_PASSWORD=Aa@12345678`
   - `FRONTEND_URL` (رابط Vercel بعد نشره)
   - `NODE_ENV=production`
5. انشر الخدمة وانسخ رابط Render الناتج (مثال: `https://coach-abu-rakhees.onrender.com`)

## نشر Frontend على Vercel

1. من [vercel.com](https://vercel.com) أنشئ **New Project** واربطه بمستودع GitHub
2. اضبط الإعدادات:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. أضف متغير البيئة:
   - `VITE_API_URL=https://your-render-backend-url.onrender.com/api`
4. انشر المشروع، ثم ارجع لـ Render وحدّث `FRONTEND_URL` برابط Vercel الناتج، وأعد نشر Backend

## متغيرات البيئة

### backend/.env

```
DATABASE_URL=postgresql://user:password@ep-example.neon.tech/coach_abu_rakhees?sslmode=require
JWT_SECRET=change-this-to-a-long-random-secret-string
ADMIN_USERNAME=Mohammed
ADMIN_PASSWORD=Aa@12345678
FRONTEND_URL=https://your-vercel-url.vercel.app
PORT=5000
NODE_ENV=production
```

### frontend/.env

```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

## رفع المشروع إلى GitHub

```bash
cd coach-abu-rakhees
git init
git add .
git commit -m "Initial commit: coach-abu-rakhees full stack app"
git branch -M main
git remote add origin https://github.com/<username>/coach-abu-rakhees.git
git push -u origin main
```

> ملفات `.env` الحقيقية مستثناة عبر `.gitignore` ولن يتم رفعها؛ فقط `.env.example` سيتم رفعه.

## بيانات دخول الأدمن

الرابط: `/admin`

```
Username: Mohammed
Password: Aa@12345678
```

يمكن تغييرها لاحقًا عبر متغيرات البيئة `ADMIN_USERNAME` و `ADMIN_PASSWORD` في Render.
