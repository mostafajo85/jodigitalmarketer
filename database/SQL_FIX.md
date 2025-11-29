# حل خطأ SQL في Neon Console

## المشكلة
عند تنفيذ `schema.sql` في Neon Console، يظهر خطأ:
```
ERROR: syntax error at or near "SERIAL"
```

## الحل ✅

### استخدم هذا SQL (نسخة مبسطة):

```sql
-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  brand_vibe TEXT,
  consistency_guide TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  phase VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  description TEXT NOT NULL,
  aspect_ratio VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_campaign_id ON assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_assets_phase ON assets(phase);
```

### خطوات التنفيذ:

1. **في Neon Console → SQL Editor**
2. **احذف** كل المحتوى القديم
3. **انسخ** الـ SQL أعلاه
4. **الصقه** في SQL Editor
5. **اضغط Run**

### التحقق من النجاح:

بعد التنفيذ، شغل هذا الـ Query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

يجب أن ترى:
- `campaigns`
- `assets`

---

## بعد إنشاء الجداول

### 1. ارجع إلى Netlify
- **Deploys** → **Trigger deploy**
- انتظر حتى ينتهي النشر

### 2. جرب التطبيق
- افتح التطبيق
- أنشئ حملة جديدة
- اذهب إلى "حملاتي"
- يجب أن تعمل بدون أخطاء! ✅

---

## إذا استمرت المشكلة

### تأكد من Environment Variables في Netlify:
```
VITE_OPENAI_API_KEY = sk-your-key-here
DATABASE_URL = postgresql://xxx (أضيفت تلقائياً من Neon)
```

### فحص Function Logs:
1. Netlify Dashboard
2. **Functions** → **get-campaigns**
3. شاهد آخر error في Logs
