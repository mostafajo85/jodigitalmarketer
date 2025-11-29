import { CampaignInputs, PromptPlanResponse, GeneratedAsset, AspectRatio, Language } from '../types';

const API_BASE = '/.netlify/functions';

/**
 * Generate a complete marketing campaign using OpenAI via Netlify Function
 */
export const generateCampaignPrompts = async (
  inputs: CampaignInputs,
  appLang: Language
): Promise<PromptPlanResponse> => {
  try {
    const response = await fetch(`${API_BASE}/generate-campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName: inputs.productName,
        description: inputs.description,
        language: inputs.language,
        brandVibe: inputs.brandVibe,
        appLang
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate campaign');
    }

    const data = await response.json();
    return {
      assets: data.assets,
      consistencyGuide: data.consistencyGuide
    };
  } catch (error) {
    console.error('Error generating campaign prompts:', error);
    throw error;
  }
};

/**
 * Regenerate a single asset with a new aspect ratio
 */
export const regenerateAsset = async (
  currentAsset: GeneratedAsset,
  inputs: CampaignInputs,
  newAspectRatio: AspectRatio,
  appLang: Language
): Promise<GeneratedAsset> => {
  try {
    const response = await fetch(`${API_BASE}/regenerate-asset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentAsset,
        inputs,
        newAspectRatio,
        appLang
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to regenerate asset');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error regenerating asset:', error);
    throw error;
  }
};
