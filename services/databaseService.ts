import { CampaignInputs, GeneratedAsset } from '../types';

const API_BASE = '/.netlify/functions';

export interface SavedCampaign {
    id: number;
    productName: string;
    description: string;
    language: string;
    brandVibe?: string;
    consistencyGuide?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CampaignWithAssets {
    campaign: SavedCampaign;
    assets: GeneratedAsset[];
}

/**
 * Save a complete campaign to the database
 */
export const saveCampaign = async (
    inputs: CampaignInputs,
    assets: GeneratedAsset[],
    consistencyGuide: string
): Promise<{ campaignId: number; createdAt: string }> => {
    try {
        const response = await fetch(`${API_BASE}/save-campaign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productName: inputs.productName,
                description: inputs.description,
                language: inputs.language,
                brandVibe: inputs.brandVibe,
                consistencyGuide,
                assets
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save campaign');
        }

        const data = await response.json();
        return {
            campaignId: data.campaignId,
            createdAt: data.createdAt
        };
    } catch (error) {
        console.error('Error saving campaign:', error);
        throw error;
    }
};

/**
 * Get all campaigns
 */
export const getCampaigns = async (): Promise<SavedCampaign[]> => {
    try {
        const response = await fetch(`${API_BASE}/get-campaigns`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch campaigns');
        }

        const data = await response.json();
        return data.campaigns.map((c: any) => ({
            id: c.id,
            productName: c.product_name,
            description: c.description,
            language: c.language,
            brandVibe: c.brand_vibe,
            createdAt: c.created_at,
            updatedAt: c.updated_at
        }));
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
    }
};

/**
 * Get a specific campaign with its assets
 */
export const getCampaign = async (id: number): Promise<CampaignWithAssets> => {
    try {
        const response = await fetch(`${API_BASE}/get-campaign?id=${id}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch campaign');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching campaign:', error);
        throw error;
    }
};

/**
 * Delete a campaign
 */
export const deleteCampaign = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE}/delete-campaign?id=${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete campaign');
        }
    } catch (error) {
        console.error('Error deleting campaign:', error);
        throw error;
    }
};
