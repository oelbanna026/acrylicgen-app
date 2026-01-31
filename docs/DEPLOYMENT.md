# دليل النشر والتشغيل (Deployment Guide)

## 1. متطلبات النظام
- خادم (VPS/Dedicated) يعمل بنظام Linux (Ubuntu/Debian مفضل).
- Nginx Web Server.
- Python 3.x (لتشغيل سكريبت البناء).

## 2. خطوات البناء (Build)
قبل رفع الملفات إلى الخادم، يجب "بناء" النسخة الإنتاجية لتصغير حجم الملفات وتحسين الأداء.

1. افتح التيرمينال في مجلد المشروع.
2. انتقل إلى مجلد الأدوات:
   ```bash
   cd tools
   ```
3. قم بتشغيل سكريبت البناء:
   ```bash
   python build.py
   ```
4. ستجد الملفات الجاهزة في مجلد `dist` الذي تم إنشاؤه حديثاً.

## 3. إعداد الخادم (Nginx)
1. قم بتثبيت Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```
2. انسخ محتويات مجلد `dist` إلى `/var/www/acrylic/dist` على الخادم.
3. انسخ ملف الإعداد `nginx/acrylic.conf` إلى `/etc/nginx/sites-available/acrylic.conf`.
4. قم بتفعيل الموقع:
   ```bash
   sudo ln -s /etc/nginx/sites-available/acrylic.conf /etc/nginx/sites-enabled/
   ```
5. افحص الإعدادات وأعد تشغيل Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 4. إعداد SSL (HTTPS)
نوصي بشدة باستخدام Certbot لتأمين الموقع بشهادة SSL مجانية من Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 5. ميزات الأمان المطبقة
- **Code Minification**: تم تصغير الكود لجعله صعب القراءة (Obfuscation).
- **Security Headers**: تم إعداد ترويسات الأمان في Nginx لمنع هجمات XSS و Clickjacking.
- **Client-Side Auth**: يوجد نظام تحقق بسيط في الواجهة الأمامية (يجب تغيير كلمة المرور في `app.js` قبل النشر).

## 6. نظام التحديثات
النظام يدعم PWA (Progressive Web App). عند رفع نسخة جديدة إلى الخادم:
1. قم بزيادة رقم الإصدار في `sw.js` (تغيير `CACHE_NAME`).
2. المتصفحات ستقوم تلقائياً بتحميل النسخة الجديدة وتحديثها للمستخدمين بفضل Service Worker.
