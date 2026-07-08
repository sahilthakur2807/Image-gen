import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

export async function callBriefGemini(prompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in .env.local');
  }

  // Tries gemini-2.5-flash-lite first, falls back to gemini-2.5-flash if unavailable
  const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Model ${model} failed (${response.status} ${response.statusText}): ${errText}`);
      }

      const result = (await response.json()) as any;
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error(`Model ${model} returned empty content`);
      }

      return JSON.parse(text);
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err.message || err);
      lastError = err;
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message || lastError}`);
}
