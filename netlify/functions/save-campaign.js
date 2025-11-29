const { Client } = require('pg');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    let client;

    try {
        const { productName, description, language, brandVibe, consistencyGuide, assets } = JSON.parse(event.body);

        if (!productName || !description || !assets) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Connect to database
        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        await client.connect();

        // Insert campaign
        const campaignResult = await client.query(
            `INSERT INTO campaigns (product_name, description, language, brand_vibe, consistency_guide) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, created_at`,
            [productName, description, language, brandVibe || null, consistencyGuide || null]
        );

        const campaignId = campaignResult.rows[0].id;
        const createdAt = campaignResult.rows[0].created_at;

        // Insert assets
        const assetInsertPromises = assets.map(asset => {
            return client.query(
                `INSERT INTO assets (campaign_id, asset_id, title, phase, prompt, description, aspect_ratio) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    campaignId,
                    asset.id,
                    asset.title,
                    asset.phase,
                    asset.prompt,
                    asset.description,
                    asset.aspectRatio || '1:1'
                ]
            );
        });

        await Promise.all(assetInsertPromises);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                campaignId,
                createdAt,
                message: 'Campaign saved successfully'
            })
        };

    } catch (error) {
        console.error('Error saving campaign:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message || 'Failed to save campaign'
            })
        };
    } finally {
        if (client) {
            await client.end();
        }
    }
};
