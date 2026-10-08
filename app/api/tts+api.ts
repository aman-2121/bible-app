/**
 * Secure Backend TTS API Route (Expo Router Server-side Route)
 *
 * CRITICAL SECURITY:
 * This code runs ONLY on the server/backend in a Node.js runtime.
 * The Addis AI API key is read from server environment variables (process.env.ADDIS_AI_API_KEY)
 * and is NEVER exposed or bundled into the client React Native application.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, language = 'am', voice = 'am-hamen', model = 'addis-voice-2' } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return Response.json(
        { success: false, error: 'Text parameter is required.' },
        { status: 400 }
      );
    }

    // Read the secret key strictly on the server
    const apiKey = process.env.ADDIS_AI_API_KEY;

    if (!apiKey) {
      // Backend not yet configured with secret key
      return Response.json(
        {
          success: false,
          error: 'Amharic audio is temporarily unavailable. Please try again later.',
        },
        { status: 503 }
      );
    }

    // Prepare payload for Addis AI Voices 2
    // Send the original Amharic text without any translation or transliteration
    const addisPayload = {
      model,
      voice: {
        language_code: language,
        voice_id: voice,
      },
      input: {
        text: text.trim(),
      },
    };

    // Forward request to Addis AI production endpoint
    const addisResponse = await fetch('https://api.addisassistant.com/api/v2/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(addisPayload),
    });

    if (!addisResponse.ok) {
      console.warn(`Addis AI TTS API error (${addisResponse.status}):`, await addisResponse.text().catch(() => ''));
      return Response.json(
        {
          success: false,
          error: 'Amharic audio is temporarily unavailable. Please try again later.',
        },
        { status: 502 }
      );
    }

    const contentType = addisResponse.headers.get('content-type') || '';

    // Handle binary audio response (e.g. audio/mpeg or audio/wav)
    if (contentType.includes('audio') || contentType.includes('octet-stream')) {
      const arrayBuffer = await addisResponse.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString('base64');
      return Response.json({
        success: true,
        audioBase64: `data:audio/mp3;base64,${base64Audio}`,
        contentType: 'audio/mp3',
      });
    }

    // Handle JSON response containing audio URL or base64
    const jsonResult = await addisResponse.json().catch(() => null);
    if (jsonResult) {
      if (jsonResult.audio_url || jsonResult.audioUrl) {
        return Response.json({
          success: true,
          audioUrl: jsonResult.audio_url || jsonResult.audioUrl,
        });
      }
      if (jsonResult.audio_base64 || jsonResult.audioBase64) {
        const b64 = jsonResult.audio_base64 || jsonResult.audioBase64;
        const fullUri = b64.startsWith('data:') ? b64 : `data:audio/mp3;base64,${b64}`;
        return Response.json({
          success: true,
          audioBase64: fullUri,
        });
      }
    }

    return Response.json(
      {
        success: false,
        error: 'Amharic audio is temporarily unavailable. Please try again later.',
      },
      { status: 500 }
    );
  } catch (error) {
    console.warn('TTS Backend route exception:', error);
    return Response.json(
      {
        success: false,
        error: 'Amharic audio is temporarily unavailable. Please try again later.',
      },
      { status: 500 }
    );
  }
}
