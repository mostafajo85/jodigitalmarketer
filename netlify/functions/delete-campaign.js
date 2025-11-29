const { Client } = require('pg');

exports.handler = async (event) => {
    if (event.httpMethod !== 'DELETE') {
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

        // Delete campaign (CASCADE will delete assets automatically)
        const result = await client.query(
            `DELETE FROM campaigns WHERE id = $1 RETURNING id`,
            [campaignId]
        );

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Campaign not found' })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                message: 'Campaign deleted successfully'
            })
        };

    } catch (error) {
        console.error('Error deleting campaign:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message || 'Failed to delete campaign'
            })
        };
    } finally {
        if (client) {
            await client.end();
        }
    }
};
