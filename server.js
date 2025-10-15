// server.js
const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get("/", (_req, res) => res.send("Revive Agent OK"));

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.object) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];

      if (message && message.text) {
        const from = message.from;
        const userMsg = message.text.body;
        console.log(`📥 ${from}: ${userMsg}`);

        const aiResponse = await getAIResponse(userMsg);
        await sendWhatsAppMessage(from, aiResponse);
      }
      return res.sendStatus(200);
    }
    return res.sendStatus(404);
  } catch (err) {
    console.error("Error:", err?.response?.data || err.message);
    return res.sendStatus(500);
  }
});

async function getAIResponse(text) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un agente amable de Revive La Memoria. Responde en español, breve y útil." },
          { role: "user", content: text }
        ],
        temperature: 0.5
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Error OpenAI:", err?.response?.data || err.message);
    return "Lo siento, tuve un problema procesando tu mensaje 😔";
  }
}

async function sendWhatsAppMessage(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(`📤 Mensaje enviado a ${to}`);
  } catch (err) {
    console.error("Error enviando mensaje:", err?.response?.data || err.message);
  }
}

app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
