function notFoundHandler(req, res, next) {
    res.status(404).json({ message: 'المسار المطلوب غير موجود' });
}

function errorHandler(err, req, res, next) {
    console.error(err.stack || err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'حدث خطأ غير متوقع في السيرفر';

    res.status(statusCode).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
