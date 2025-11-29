# Database Setup Guide

## Neon PostgreSQL Database

### 1. Create Database on Netlify

1. Go to your Netlify project dashboard
2. Navigate to **Integrations** tab
3. Click **Add new database**
4. Select **Neon** from the list
5. Click **Create new database**

This will automatically:
- Create a Neon PostgreSQL database
- Add `DATABASE_URL` to your environment variables
- Install the Neon extension on your team

### 2. Run Schema

After creating the database:

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **SQL Editor**
4. Copy the contents of `schema.sql`
5. Paste and execute

### 3. Verify Setup

Run this query to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- `campaigns`
- `assets`
