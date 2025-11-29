const { Client } = require('pg');

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    let client;

    try {
        // Connect to database
        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        await client.connect();

        // Get all campaigns
        const result = await client.query(
            `SELECT id, product_name, description, language, brand_vibe, created_at, updated_at
       FROM campaigns 
       ORDER BY created_at DESC`
        );

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                campaigns: result.rows
            })
        };

    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message || 'Failed to fetch campaigns'
            })
        };
    } finally {
        if (client) {
            await client.end();
        }
    }
};
