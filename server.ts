/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY", // fallback to prevent startup crash if undefined
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Simple health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Server-side recipe generator API proxy
app.post("/api/recipe", async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Please list some ingredients or notes to parse!" });
    }

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Graceful fallback when the actual key is not set
      return res.json({
        recipeName: "Faux-Steel Quick Toast",
        prepTime: "5 mins",
        difficulty: "Easy",
        story: "Since we are running in demo mode without an active Gemini API key, enjoy this quick kitchen classic that can be enjoyed while looking at a stainless steel fridge!",
        ingredients: ["Bread slice", "Salted Butter", "A pinch of Imagination"],
        steps: [
          "Toast the bread slice inside a standard toaster until deep golden brown.",
          "Spread salted butter edge-to-edge on the toasted slice while hot.",
          "Close your eyes, feel the metallic industrial sheen of your fridge, and take a big bite."
        ],
        magneticScore: "10/10"
      });
    }

    const itemsStr = items.join(", ");
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Create a creative, delightful, and realistic kitchen recipe that can be made using one or more of the following available ingredients found in refrigerator sticky notes/lists: ${itemsStr}. Feel free to assume normal pantry staples are available (salt, water, oil, spices). Provide the answer in a beautiful structured JSON object fitting the theme of a cozy household kitchen card.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING, description: "Name of the dish" },
            prepTime: { type: Type.STRING, description: "Preparation and cook time" },
            difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" },
            story: { type: Type.STRING, description: "A heartwarming 1-2 sentence description explaining why this fits a home kitchen" },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of ingredients needed"
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step instructions"
            },
            magneticScore: { type: Type.STRING, description: "A fun themed score like '95% Magnetic' or '4.5 Fridge Stars'" }
          },
          required: ["recipeName", "prepTime", "difficulty", "ingredients", "steps", "magneticScore"]
        },
        systemInstruction: "You are a friendly, encouraging neighborhood kitchen chef. You help people cook wholesome, easy food with whatever ingredients they currently have on their magnetic lists."
      }
    });

    const responseText = response.text;
    if (responseText) {
      const data = JSON.parse(responseText.trim());
      return res.json(data);
    } else {
      throw new Error("Empty response from GenAI");
    }
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate recipe ideas from Gemini." });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
