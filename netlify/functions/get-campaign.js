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
        const campaignId = event.queryStringParameters?.id;

        if (!campaignId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Campaign ID is required' })
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

        // Get campaign
        const campaignResult = await client.query(
            `SELECT * FROM campaigns WHERE id = $1`,
            [campaignId]
        );

        if (campaignResult.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Campaign not found' })
            };
        }

        // Get assets for this campaign
        const assetsResult = await client.query(
            `SELECT * FROM assets WHERE campaign_id = $1 ORDER BY asset_id ASC`,
            [campaignId]
        );

        const campaign = campaignResult.rows[0];
        const assets = assetsResult.rows.map(row => ({
            id: row.asset_id,
            title: row.title,
            phase: row.phase,
            prompt: row.prompt,
            description: row.description,
            aspectRatio: row.aspect_ratio
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                campaign: {
                    id: campaign.id,
                    productName: campaign.product_name,
                    description: campaign.description,
                    language: campaign.language,
                    brandVibe: campaign.brand_vibe,
                    consistencyGuide: campaign.consistency_guide,
                    createdAt: campaign.created_at,
                    updatedAt: campaign.updated_at
                },
                assets
            })
        };

    } catch (error) {
        console.error('Error fetching campaign:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message || 'Failed to fetch campaign'
            })
        };
    } finally {
        if (client) {
            await client.end();
        }
    }
};
