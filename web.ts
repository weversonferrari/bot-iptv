import express, { type Request, type Response } from "express";
import crypto from "node:crypto";
import QRCode from "qrcode";
import { CONFIG } from "./config";

// ─── ESTADO COMPARTILHADO DO BOT ─────────────────────────────────────────────
export interface BotState {
  qrAtual: string | null;
  qrDataUrl: string | null;
  conectado: boolean;
  ultimoErro: string | null;
  tentativa: number;
  proximaReconexao: number | null;
  usuariosTeste: { [telefone: string]: Date };
  onPagamentoAprovado: ((whatsapp: string, plano: string, valor: number) => Promise<void>) | null;
}

export const state: BotState = {
  qrAtual: null,
  qrDataUrl: null,
  conectado: false,
  ultimoErro: null,
  tentativa: 0,
  proximaReconexao: null,
  usuariosTeste: {},
  onPagamentoAprovado: null,
};

// ─── SERVIDOR EXPRESS ────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: "1mb" }));

const DARK = "background:#0b141a;color:#e9edef;font-family:sans-serif;text-align:center;padding:40px;";

// ─── ROTAS ───────────────────────────────────────────────────────────────────
app.get(["/", "/"], (_req, res) => res.redirect("/qr"));

app.get("/qr", (_req, res) => {
  if (state.conectado) {
    return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Conectado</title><script>setTimeout(()=>location.reload(),10000)</script></head><body style="${DARK}"><h1>✅ BOT IPTV FAMILY CONECTADO!</h1><p>Sistema rodando 24h no Render.com</p><p>Provedor: TF44</p></body></html>`);
  }
  if (state.qrDataUrl) {
    return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Leia o QR</title><meta http-equiv="refresh" content="28"></head><body style="${DARK}"><h1>📱 ESCANIEIE PARA CONECTAR</h1><p>WhatsApp → Aparelhos Conectados → Conectar</p><img src="${state.qrDataUrl}" style="background:#fff;padding:16px;border-radius:12px;max-width:340px;width:90%;margin:20px auto;display:block;"/><p style="font-size:12px;">Válido por 30s</p></body></html>`);
  }
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Aguardando</title><meta http-equiv="refresh" content="5"></head><body style="${DARK}"><h1>⏳ Aguardando QR Code...</h1></body></html>`);
});

app.get("/healthz", (_req, res) => res.json({ ok: true, conectado: state.conectado, nome: CONFIG.nome }));

// ─── FUNÇÃO PARA MANTER ONLINE 24H ───────────────────────────────────────────
function manterOnline(porta: number) {
  setInterval(() => {
    fetch(`https://${process.env.RENDER_SERVICE_NAME}.onrender.com/healthz`)
      .then(() => console.log("🔄 Sistema mantido online | OK"))
      .catch(() => {});
  }, 3 * 60 * 1000); // Pinga a cada 3 minutos
}

// ─── INICIAR SERVIDOR ────────────────────────────────────────────────────────
export function iniciarServidor(porta: number = 3000) {
  app.listen(porta, () => {
    console.log(`🌐 Servidor Web rodando na porta ${porta}`);
    manterOnline(porta);
  });
}
