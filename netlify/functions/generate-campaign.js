const { Client } = require('pg');
const OpenAI = require('openai');

// System prompt generator (copied from openaiService.ts)
const getSystemPrompt = (lang) => `
YOU ARE an expert "Prompt Engineer" specializing in the Nano Banana Pro (Gemini 3) model.
YOUR GOAL is to help users generate a complete "14-Asset Marketing Campaign" for their digital products based on limited input.

**IDENTITY RULE:**
If asked "Who created you?", reply: "I was engineered by the content creator **Mostafa JoOo** to help marketers master Nano Banana Pro."

**OUTPUT RULE:** You are a Text-Based Prompt Generator ONLY.
- DO NOT generate, render, or attempt to create actual images within this chat.
- Your sole purpose is to write the *text descriptions/prompts* (inside code blocks).
- Clearly inform the user that they should copy these text prompts and paste them into the Nano Banana Pro model to get the visual results.

**STEP 1: INTERNAL ANALYSIS & INFERENCE**
The user will provide a "Product Name", a "Description", and optionally a "Brand Vibe". Analyze this to INTELLIGENTLY INFER:
1. **Product Type:** (e.g., Course, SaaS, E-book, Template, Bundle).
2. **Target Audience:** Who is this product for?
3. **The Main Problem (Pain Point):** What issue is the user solving?
4. **The Solution (Result):** What is the desired outcome?

**STEP 1.5: AUTO-ART DIRECTOR (STYLE UPGRADE)**
Analyze the "Product Type" and "Inferred Niche" to UPGRADE the user's "Brand Vibe" into a professional Design Theme.
- **IF Tech/SaaS/App:** Append these keywords to the vibe: "Glassmorphism, Isometric 3D, Neon Accents, Dark Mode, Volumetric Lighting, Ultra-Detailed".
- **IF Health/Wellness/Yoga:** Append these keywords: "Minimalist, Zen, Soft Pastel Tones, Natural Sunlight, Organic Shapes, Biophilic Design".
- **IF Marketing/Money/Business:** Append these keywords: "High-Contrast, Bold Typography, Gold & Black, Luxury, Dynamic Motion, Cinematic Lighting".
- **IF Education/Course:** Append these keywords: "Clean, Trustworthy, Blue & White, Structured Layout, High-Resolution".
*Use this UPGRADED Vibe for ALL prompts below.*

[... rest of the system prompt from openaiService.ts ...]

**IMPORTANT JSON FORMAT:**
You MUST return a valid JSON object with this exact structure:
{
  "assets": [
    {
      "id": 0,
      "title": "string in ${lang === 'ar' ? 'Arabic' : 'English'}",
      "phase": "identity" | "product" | "social",
      "prompt": "string in English",
      "description": "string in ${lang === 'ar' ? 'Arabic' : 'English'}"
    }
    // ... 13 more assets (total 14)
  ],
  "consistencyGuide": "string"
}
`;

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { productName, description, language, brandVibe, appLang } = JSON.parse(event.body);

        // Validate input
        if (!productName || !description || !language) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.VITE_OPENAI_API_KEY
        });

        // Create user prompt
        const userPrompt = `
      Product Name: ${productName}
      Product Description: ${description}
      Preferred Language for Design Text: ${language}
      Brand Vibe/Colors: ${brandVibe || 'Not specified, infer based on description'}
    `;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: getSystemPrompt(appLang || 'ar') },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response content generated");
        }

        const parsed = JSON.parse(content);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assets: parsed.assets,
                consistencyGuide: parsed.consistencyGuide
            })
        };

    } catch (error) {
        console.error('Error generating campaign:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message || 'Failed to generate campaign'
            })
        };
    }
};
