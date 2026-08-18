import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Coach AI endpoint
app.post('/api/coach', async (req, res) => {
  try {
    const { message, context } = req.body;
    const ai = getAIClient();

    if (!ai) {
      // Intelligent fallback responses tailored to Rally Padel Club
      const msgLower = (message || '').toLowerCase();
      let reply = "I'm your Rally Pro Club Coach! Center Court is currently in high demand for evening slots. Let me know if you'd like me to reserve it at 19:00 or suggest an alternative.";

      if (msgLower.includes('court 4') || msgLower.includes('promo') || msgLower.includes('tuesday')) {
        reply = "I analyzed Tuesday utilization: Court 4 has 42% lower occupancy between 2:00 PM and 5:00 PM. A 20% 'Happy Hour Rallies' promo could boost overall revenue by ~14% without cannibalizing prime time.";
      } else if (msgLower.includes('center court') || msgLower.includes('19:00') || msgLower.includes('book') || msgLower.includes('reserve')) {
        reply = "Center Court at 19:00 is ideal for a high-intensity match! It features panoramic championship glass and 1000 Lux pro lighting. Would you like me to lock this in and add a can of Head Pro balls?";
      } else if (msgLower.includes('peak') || msgLower.includes('occupancy') || msgLower.includes('stats') || msgLower.includes('revenue')) {
        reply = "Current club occupancy is pacing at 88% (+2% this week). Peak hour is locked at 6:00 PM with all 5 courts consistently booked. Weekend morning slots are also trending towards 95% capacity.";
      } else if (msgLower.includes('racket') || msgLower.includes('gear') || msgLower.includes('equipment')) {
        reply = "We offer Babolat Air Viper and Bullpadel Vertex 03 rentals for $5.00/session, freshly gripped and balanced for precision play.";
      }

      return res.json({
        reply,
        suggestion: {
          court: 'Center Court',
          time: '19:00',
          price: '$45.00',
        },
      });
    }

    const systemInstruction = `
You are the AI Coach & Club Manager for "Rally", an ultra-premium, elite padel and racquet sports club.
The club has 5 courts:
- Center Court: Indoor, Panoramic Championship Glass, Pro Surface, $45/hr (Top performer)
- Court 2: Indoor, Standard Mondo Supercourt, $45/hr
- Court 3: Outdoor Covered, Standard Turf, $40/hr
- Court 4: Indoor, Panoramic, $45/hr (Great for fast rallies)
- Court 5: Outdoor, Championship Glass, $40/hr

Current Club Context:
${JSON.stringify(context || {})}

Tone: Confident, sleek, highly athletic, executive, and encouraging.
Help users reserve courts, optimize match schedules, offer tactical tips, or analyze club occupancy and revenue trends.
Keep responses concise (2-4 sentences max), punchy, and actionable.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: message || 'Give me a quick insight on today court occupancy and recommendations.',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || "Center Court at 19:00 is primed for high-speed action. Let's get you on court.",
    });
  } catch (error: any) {
    console.error('Error in /api/coach:', error);
    res.status(500).json({
      error: 'Failed to generate coach response',
      fallback: 'Center Court at 19:00 is currently available. Let me know if you would like me to lock it in!',
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rally Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
