
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/api/status", (req, res) => {
  res.json({
    ready: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, size, style, category } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter an image description."
      });
    }

    const allowedSizes = [
      "1024x1024",
      "1024x1536",
      "1536x1024"
    ];

    const selectedSize = allowedSizes.includes(size)
      ? size
      : "1024x1024";

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt:
        "Create a high-quality image. Category: " +
        (category || "Creative") +
        ". Style: " +
        (style || "Photorealistic") +
        ". Description: " +
        prompt,
      size: selectedSize,
      quality: "high",
      n: 1
    });

    const image = result.data?.[0]?.b64_json;

    if (!image) {
      throw new Error("No image was returned.");
    }

    res.json({
      success: true,
      image: "data:image/png;base64," + image
    });

  } catch (error) {
    console.error("Image error:", error);

    res.status(500).json({
      error: "Image generation failed. Check API key and API billing."
    });
  }
});

app.listen(PORT, () => {
  console.log("Makkal Tholan AI running on port " + PORT);
});
