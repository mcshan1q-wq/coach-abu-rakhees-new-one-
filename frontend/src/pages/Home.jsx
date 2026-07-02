import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
    { icon: '🍗', title: 'تتبع الماكروز', text: 'سجّل البروتين والكارب والدهون والسعرات لكل وجبة بسهولة تامة.' },
    { icon: '⚖️', title: 'تتبع الوزن', text: 'راقب وزنك يوميًا واطّلع على معدل التغيير الأسبوعي والشهري.' },
    { icon: '📊', title: 'إحصائيات ورسوم بيانية', text: 'رسوم بيانية توضح تقدمك نحو هدفك بشكل واضح واحترافي.' },
    { icon: '🎯', title: 'أهداف مخصصة', text: 'حدد أهدافك من السعرات والبروتين والكارب والدهون وعدّلها متى شئت.' },
    { icon: '🏋️', title: 'روح النادي والحديد', text: 'تصميم رياضي يحفزك على الالتزام بجدولك الغذائي والتدريبي.' },
    { icon: '📱', title: 'يعمل على كل الأجهزة', text: 'تجربة متكاملة على الكمبيوتر والجوال والأجهزة اللوحية.' }
];

export default function Home() {
    return (
        <div className="home-page">
            <nav className="home-nav">
                <div className="home-nav-brand">
                    <span className="brand-icon">🏋️</span>
                    <span className="brand-text">الكوتش أبو رخيص</span>
                </div>
                <div className="home-nav-actions">
                    <Link to="/login" className="btn btn-outline">تسجيل الدخول</Link>
                    <Link to="/register" className="btn btn-primary">إنشاء حساب</Link>
                </div>
            </nav>

            <header className="hero">
                <div className="hero-content">
                    <span className="hero-badge">💪 نظامك الغذائي بين يديك</span>
                    <h1 className="hero-title">
                        الكوتش أبو رخيص
                        <span className="hero-subtitle-line">تتبع صحتك، تغذيتك، ووزنك بدقة واحترافية</span>
                    </h1>
                    <p className="hero-description">
                        منصة عربية متكاملة لتتبع السعرات والماكروز والوزن يوميًا، مصممة لتعينك على
                        الوصول لهدفك سواء كنت تبني عضلات أو تخسر وزنًا أو تحافظ على لياقتك.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg">ابدأ رحلتك الآن</Link>
                        <Link to="/login" className="btn btn-outline btn-lg">لدي حساب بالفعل</Link>
                    </div>
                </div>
            </header>

            <section className="features-section">
                <h2 className="section-title">كل ما تحتاجه في مكان واحد</h2>
                <div className="features-grid">
                    {FEATURES.map((f) => (
                        <div className="feature-card" key={f.title}>
                            <div className="feature-icon">{f.icon}</div>
                            <h3 className="feature-title">{f.title}</h3>
                            <p className="feature-text">{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="home-footer">
                <p>© {new Date().getFullYear()} الكوتش أبو رخيص - كل الحقوق محفوظة</p>
            </footer>
        </div>
    );
}
