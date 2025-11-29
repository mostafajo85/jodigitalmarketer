# حل خطأ "فشل تحميل الحملات"

## السبب
الخطأ يظهر لأن قاعدة البيانات Neon غير مربوطة بالتطبيق بعد.

## الحل السريع

### الخطوة 1: ربط Neon Database
1. اذهب إلى [Netlify Dashboard](https://app.netlify.com)
2. اختر مشروع `nano-marketer-pro`
3. اذهب إلى تبويب **Integrations**
4. ابحث عن **"Neon"**
5. اضغط **"Add new database"**
6. اضغط **"Create new database"**

✅ سيتم إنشاء قاعدة البيانات وإضافة `DATABASE_URL` تلقائياً

### الخطوة 2: تنفيذ Schema
1. اذهب إلى [Neon Console](https://console.neon.tech)
2. اختر المشروع الجديد
3. اذهب إلى **SQL Editor**
4. انسخ المحتوى من ملف `database/schema.sql`
5. الصقه في SQL Editor
6. اضغط **Run**

### الخطوة 3: إعادة النشر
1. ارجع إلى Netlify Dashboard
2. اذهب إلى تبويب **Deploys**
3. اضغط **"Trigger deploy"**
4. انتظر حتى ينتهي النشر

### الخطوة 4: تجربة التطبيق
1. افتح التطبيق
2. أنشئ حملة جديدة
3. اذهب إلى "حملاتي"
4. يجب أن تظهر الحملة! ✅

---

## ملاحظات مهمة

### للتطوير المحلي (Local Development)
إذا كنت تريد الاختبار محلياً:

```bash
# 1. أنشئ ملف .env.local
VITE_OPENAI_API_KEY=sk-your-key
DATABASE_URL=postgresql://user:pass@host/db

# 2. ثبت المكتبات
npm install

# 3. شغل التطبيق محلياً
netlify dev
```

### التحقق من الإعداد
للتأكد من أن كل شيء يعمل:
1. افتح Netlify → **Functions**
2. يجب أن ترى 6 functions
3. اضغط على `get-campaigns`
4. تحقق من Logs - لا يجب أن يكون هناك أخطاء

---

## إذا استمر الخطأ

### 1. تأكد من DATABASE_URL
```bash
# في Netlify → Site settings → Environment variables
DATABASE_URL = postgresql://xxx.neon.tech/xxx
```

### 2. تأكد من Schema
```sql
-- في Neon Console:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- يجب أن ترى:
-- campaigns
-- assets
```

### 3. فحص Function Logs
- Netlify → Functions → get-campaigns
- انظر إلى آخر error message

---

## الدعم
إذا واجهت مشاكل:
- افتح Issue في GitHub
- راجع `DEPLOYMENT.md` للتفاصيل الكاملة
