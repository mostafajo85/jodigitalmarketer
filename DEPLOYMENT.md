# دليل النشر على Netlify

## المتطلبات الأساسية
- حساب على [Netlify](https://netlify.com)
- مفتاح OpenAI API
- Git repository (GitHub, GitLab, أو Bitbucket)

---

## خطوات النشر

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. إعداد Environment Variables محلياً (للاختبار)

أنشئ ملف `.env.local`:
```env
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
DATABASE_URL=postgresql://user:password@host/database
```

### 3. اختبار محلي
```bash
# للاختبار مع Netlify Functions محلياً
npm install -g netlify-cli
netlify dev

# سيعمل على http://localhost:8888
```

---

## النشر على Netlify

### الطريقة 1: عبر Netlify Dashboard (الأسهل)

#### الخطوة 1: ربط Git Repository
1. اذهب إلى [Netlify Dashboard](https://app.netlify.com)
2. اضغط **"Add new site"** → **"Import an existing project"**
3. اختر Git provider (GitHub/GitLab/Bitbucket)
4. اختر repository: `nano-marketer-pro2`

#### الخطوة 2: إعدادات البناء
Netlify سيكتشف الإعدادات تلقائياً من `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

اضغط **"Deploy site"**

#### الخطوة 3: إضافة Neon Database
1. بعد النشر، اذهب إلى **Integrations** tab
2. ابحث عن **Neon** واضغط **"Add new database"**
3. اضغط **"Create new database"**
4. سيتم إنشاء قاعدة البيانات وإضافة `DATABASE_URL` تلقائياً

#### الخطوة 4: تنفيذ Database Schema
1. اذهب إلى [Neon Console](https://console.neon.tech)
2. اختر المشروع الجديد
3. اذهب إلى **SQL Editor**
4. انسخ محتوى `database/schema.sql` ونفذه
5. تحقق من إنشاء الجداول:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```

#### الخطوة 5: إضافة OpenAI API Key
1. في Netlify Dashboard → **Site settings** → **Environment variables**
2. اضغط **"Add a variable"**
3. أضف:
   - **Key**: `VITE_OPENAI_API_KEY`
   - **Value**: `sk-your-actual-openai-api-key`
4. **مهم**: اختر **"Functions"** scope (ليس Browser)

#### الخطوة 6: إعادة النشر
1. اذهب إلى **Deploys** tab
2. اضغط **"Trigger deploy"** → **"Deploy site"**

---

### الطريقة 2: عبر Netlify CLI

```bash
# تسجيل الدخول
netlify login

# ربط المشروع
netlify init

# إضافة Environment Variables
netlify env:set VITE_OPENAI_API_KEY "sk-your-key-here"

# النشر
netlify deploy --prod
```

---

## التحقق من النشر

### 1. اختبار التطبيق
- افتح الموقع المنشور
- جرب إنشاء حملة جديدة
- تحقق من ظهور رسالة "تم حفظ الحملة بنجاح"
- اذهب إلى "حملاتي" للتأكد من الحفظ

### 2. فحص Netlify Functions
في Netlify Dashboard → **Functions**:
- يجب أن ترى 6 functions
- `generate-campaign`
- `regenerate-asset`
- `save-campaign`
- `get-campaigns`
- `get-campaign`
- `delete-campaign`

### 3. فحص Database
في Neon Console → **Tables**:
- `campaigns` - يجب أن يحتوي على الحملات
- `assets` - يحتوي على الأصول

---

## استكشاف الأخطاء

### خطأ: "Failed to generate campaign"
**السبب**: مفتاح OpenAI غير موجود أو خاطئ
**الحل**:
1. تحقق من Environment Variables في Netlify
2. تأكد من scope = Functions
3. تأكد من المفتاح صحيح وله credits

### خطأ: "Failed to save campaign"
**السبب**: قاعدة البيانات غير متصلة
**الحل**:
1. تحقق من `DATABASE_URL` في Environment Variables
2. تأكد من تشغيل Schema في Neon Console
3. تحقق من أن Neon Database ليس في حالة Pause

### خطأ: "Function timeout"
**السبب**: OpenAI يأخذ وقتاً طويلاً
**الحل**:
- في Free Plan، Timeout = 10 ثواني
- ترقية إلى Netlify Pro (Timeout = 26 ثانية)
- أو تقليل عدد الأصول المولدة

### خطأ: "Database connection error"
**الحل**:
```sql
-- في Neon Console، تحقق من الاتصال:
SELECT 1;
```

---

## الصيانة

### تحديث Schema
إذا احتجت لتعديل قاعدة البيانات:
1. عدّل `database/schema.sql`
2. نفّذ التغييرات في Neon Console
3. push التغييرات إلى Git

### مراقبة الاستخدام
- **Netlify Functions**: 125,000 استدعاء/شهر (Free)
- **Neon Database**: 512MB + 3GB Storage (Free)
- **OpenAI API**: حسب استخدامك

### Backup
```sql
-- في Neon Console، export البيانات:
COPY campaigns TO '/tmp/campaigns.csv' CSV HEADER;
COPY assets TO '/tmp/assets.csv' CSV HEADER;
```

---

## الترقية

### إلى Netlify Pro ($19/شهر)
- Function timeout: 26 ثانية
- 2M function requests/شهر
- Background Functions

### إلى Neon Pro ($19/شهر)
- 10GB Storage
- Unlimited Compute Hours
- Auto-scaling

---

## الدعم
للمساعدة:
- Netlify Docs: https://docs.netlify.com
- Neon Docs: https://neon.tech/docs
- OpenAI Docs: https://platform.openai.com/docs
