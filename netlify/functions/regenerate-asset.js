const OpenAI = require('openai');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { currentAsset, inputs, newAspectRatio, appLang } = JSON.parse(event.body);

        if (!currentAsset || !inputs || !newAspectRatio) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const openai = new OpenAI({
            apiKey: process.env.VITE_OPENAI_API_KEY
        });

        const reGenSystemPrompt = `
      YOU ARE an expert "Prompt Engineer". 
      TASK: Rewrite a specific image generation prompt to match a NEW Aspect Ratio while maintaining the original creative intent, style, and text rendering rules.
      
      TARGET ASPECT RATIO: ${newAspectRatio}
      
      TYPOGRAPHY & SPELLING GUARD:
      - If "Preferred Language for Design Text" is Arabic, you MUST:
        1. Translate the text into Arabic.
        2. Select a Font Style: "Bold Geometric Arabic (Kufic)" for Tech, "Elegant Calligraphy" for Luxury, or "Clean Sans-Serif" for General.
        3. Append instruction: Write "[Arabic Text]" in [Selected Font Style].
        4. Critical Text Rule: Verify the Arabic spelling explicitly. Ensure all letters are connected correctly.
      
      - If English, use: Write "[English Text]" in Bold Modern Font.

      INTELLIGENCE LAYERS:
      - If the prompt is for a Dashboard or Before/After chart and relates to Finance/Crypto/Marketing, ensure it includes: "Grounding: Use Google Search to find realistic 2025 market trends/stats..."
      - If the prompt is complex (Packaging, Dashboard, Bundle, Notification, Roadmap), PREPEND: "Instruction: Before generating pixels, create a mental layout map to ensure no text overlaps with visual elements."

      COMPOSITION RULES:
      - For social media posts (Carousel, Quote, Notification), keep text in the "Safe Zone" (Center 80%).
      - Always include this parameter at the end: Avoid: [Blurry, low resolution, distorted text, extra fingers, bad anatomy, watermark, cartoonish style (unless specified), over-saturated].
      
      **IMPORTANT JSON FORMAT:**
      You MUST return a valid JSON object with this exact structure:
      {
        "id": number,
        "title": "string in ${appLang === 'ar' ? 'Arabic' : 'English'}",
        "phase": "identity" | "product" | "social",
        "prompt": "string in English",
        "description": "string in ${appLang === 'ar' ? 'Arabic' : 'English'}"
      }
    `;

        const userPrompt = `
      Original Prompt: ${currentAsset.prompt}
      Asset Title: ${currentAsset.title}
      Product Name: ${inputs.productName}
      Preferred Language for Design Text: ${inputs.language}
      
      REQUIRED CHANGE: Change the Aspect Ratio to ${newAspectRatio}. 
      If the composition needs to change (e.g. from Square to Widescreen), adjust the scene description accordingly.
      Keep the rest of the style/vibe consistent.
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: reGenSystemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Failed to regenerate asset");
        }

        const parsed = JSON.parse(content);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...currentAsset,
                prompt: parsed.prompt,
                description: parsed.description,
                aspectRatio: newAspectRatio
            })
        };

    } catch (error) {
        console.error('Error regenerating asset:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message || 'Failed to regenerate asset'
            })
        };
    }
};
