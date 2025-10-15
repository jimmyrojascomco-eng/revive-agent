# 🤖 Revive Agent
Agente inteligente de Revive La Memoria conectado a WhatsApp Cloud API y OpenAI.

## 🚀 Requisitos
- Node.js 18+
- App de Meta con WhatsApp Cloud y un número vinculado
- API Key de OpenAI

## ⚙️ Instalación
1. Clona este repo.
2. Crea un archivo `.env` basado en `.env.example`.
3. Ejecuta:
   ```bash
   npm install
   npm start
   ```

## 🌐 Webhook
Configura en Meta:
- **Verify Token:** reviveverifytoken
- **Callback URL:** https://TU-APP.onrender.com/webhook
