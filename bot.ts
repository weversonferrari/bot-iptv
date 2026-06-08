import { iniciarServidor, state } from "./web";
import { CONFIG } from "./config";
import { criarTesteReal, jaUsouTeste } from "./iptv";
import QRCode from "qrcode";

// 📚 BIBLIOTECA DO WHATSAPP (BAILEYS - A MAIS ATUAL E ESTÁVEL)
import {
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  proto,
  getContentType,
  WASocket,
  delay
} from "@whiskeysockets/baileys";
import * as fs from "fs";
import { Boom } from "@hapi/boom";

// ─── CONFIGURAÇÕES GERAIS ────────────────────────────────────────────────────
const AUTH_FOLDER = "./auth";
if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, { recursive: true });

const store = makeInMemoryStore({ logger: undefined });
store?.readFromFile(`${AUTH_FOLDER}/store.json`);
setInterval(() => store?.writeToFile(`${AUTH_FOLDER}/store.json`), 15000);

// ─── FUNÇÕES AUXILIARES ─────────────────────────────────────────────────────
function ehDono(remetente: string): boolean {
  return remetente === CONFIG.dono_numero;
}

// Controle de Flood
const controleMensagens: { [usuario: string]: { contador: number; inicio: number } } = {};
function verificarFlood(usuario: string): boolean {
  const agora = Date.now();
  if (!controleMensagens[usuario]) controleMensagens[usuario] = { contador: 1, inicio: agora };
  const dados = controleMensagens[usuario];
  if ((agora - dados.inicio)/1000 > CONFIG.flood.janela_segundos) dados.contador = 1;
  else dados.contador++;
  return dados.contador > CONFIG.flood.max_mensagens;
}

// ─── PROCESSAR MENSAGENS RECEBIDAS ────────────────────────────────────────────
async function processarMensagem(cliente: WASocket, mensagem: proto.IWebMessageInfo, remetente: string, conteudo: string) {
  if (remetente.endsWith("@g.us") || mensagem.key.fromMe) return; // Ignora grupos e mensagens suas

  console.log(`📩 Mensagem de: ${remetente.split("@")[0]} | Texto: ${conteudo}`);

  if (verificarFlood(remetente)) {
    return cliente.sendMessage(remetente, { text: "⚠️ Calma aí! Envie mensagens mais devagar." });
  }

  const texto = conteudo.trim().toLowerCase();

  // 📋 MENU PRINCIPAL
  if (!["1","2","3","4","teste","planos","suporte","revenda"].includes(texto)) {
    return cliente.sendMessage(remetente, {
      text: `👋 Olá! Seja bem-vindo(a) ao *${CONFIG.nome}* 📺

Escolha uma opção:

▫️ *1* ➜ 🧪 TESTE GRÁTIS (24h)
▫️ *2* ➜ 📦 VER PLANOS E PREÇOS
▫️ *3* ➜ 🛟 FALAR COM SUPORTE
▫️ *4* ➜ 🤝 SEJA REVENDEDOR

💡 Digite o número ou o nome.`
    });
  }

  // 🧪 OPÇÃO 1: TESTE GRÁTIS
  if (texto === "1" || texto === "teste") {
    if (jaUsouTeste(remetente)) return cliente.sendMessage(remetente, { text: CONFIG.teste.mensagens.ja_pediu });

    await cliente.sendMessage(remetente, { text: CONFIG.teste.mensagens.processando });
    const resultado = await criarTesteReal(remetente);

    if (!resultado || resultado.reply === "erro") {
      await cliente.sendMessage(remetente, { text: CONFIG.teste.mensagens.erro });
      return cliente.sendMessage(CONFIG.dono_numero, { text: `⚠️ ERRO AO CRIAR TESTE\nCliente: ${remetente}` });
    }

    const msgFinal = CONFIG.teste.mensagens.modelo
      .replace(/{usuario}/g, resultado.usuario||"")
      .replace(/{senha}/g, resultado.senha||"")
      .replace(/{vencimento}/g, resultado.vencimento||"")
      .replace(/{conexoes}/g, resultado.conexoes||"")
      .replace(/{link_m3u}/g, resultado.link_m3u||"")
      .replace(/{link_curto_m3u}/g, resultado.link_curto_m3u||"")
      .replace(/{link_hls}/g, resultado.link_hls||"")
      .replace(/{link_curto_hls}/g, resultado.link_curto_hls||"")
      .replace(/{link_ssiptv}/g, resultado.link_ssiptv||"");

    await cliente.sendMessage(remetente, { text: msgFinal });
    await cliente.sendMessage(CONFIG.dono_numero, { text: `✅ TESTE CRIADO\nCliente: ${remetente}\nUsuário: ${resultado.usuario}` });
    return;
  }

  // 📦 OPÇÃO 2: PLANOS E PREÇOS
  if (texto === "2" || texto === "planos") {
    return cliente.sendMessage(remetente, {
      text: `📋 *NOSSOS PLANOS* 💳

⭐ *PLANO 1 TELA*
💰 1º MÊS: R$ ${CONFIG.planos.mensal_1tela.valor_promocao.toFixed(2)} (PROMOÇÃO)
🔄 RENOVAÇÃO: R$ ${CONFIG.planos.mensal_1tela.valor_normal.toFixed(2)} / mês

⭐ *PLANO 2 TELAS*
💰 R$ ${CONFIG.planos.mensal_2telas.valor.toFixed(2)} / mês

⭐ *TRIMESTRAL:* R$ ${CONFIG.planos.trimestral.valor.toFixed(2)}
⭐ *SEMESTRAL:* R$ ${CONFIG.planos.semestral.valor.toFixed(2)}
⭐ *ANUAL:* R$ ${CONFIG.planos.anual.valor.toFixed(2)}

✅ HD, 4K, Filmes, Séries, Esportes
📞 Para contratar, fale com nosso atendimento!`
    });
  }

  // 🛟 OPÇÃO 3: SUPORTE
  if (texto === "3" || texto === "suporte") {
    return cliente.sendMessage(remetente, {
      text: `🛟 *SUPORTE ${CONFIG.nome}*

🕒 Seg-Sex: ${CONFIG.suporte.seg_sex.inicio}h às ${CONFIG.suporte.seg_sex.fim}h
🕒 Sáb: ${CONFIG.suporte.sabado.inicio}h às ${CONFIG.suporte.sabado.fim}h

👤 Responsável: ${CONFIG.nome_dono}
📱 wa.me/${CONFIG.dono_numero.replace("@s.whatsapp.net","")}

Estamos à disposição! 😊`
    });
  }

  // 🤝 OPÇÃO 4: REVENDA
  if (texto === "4" || texto === "revenda") {
    return cliente.sendMessage(remetente, {
      text: `🤝 *PROGRAMA DE REVENDA* 💸

Quer ganhar dinheiro? Seja parceiro!

✅ Preços especiais
✅ Suporte exclusivo
✅ Painel próprio
💰 Adesão: R$ ${CONFIG.planos.revenda.valor.toFixed(2)}

🔗 Cadastre-se: ${CONFIG.link_indicacao_revenda}`
    });
  }

  // 🛠️ COMANDOS DO DONO
  if (ehDono(remetente)) {
    if (texto === "!status") {
      return cliente.sendMessage(remetente, { text: `🤖 *STATUS*\nConectado: ${state.conectado ? "SIM ✅" : "NÃO ❌"}\nTestes criados: ${Object.keys(state.usuariosTeste).length}` });
    }
  }
}

// ─── CONEXÃO PRINCIPAL WHATSAPP ──────────────────────────────────────────────
async function conectarWhatsApp() {
  try {
    const { version } = await fetchLatestBaileysVersion();
    const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    const cliente: WASocket = makeWASocket({
      version,
      auth: authState,
      printQRInTerminal: false,
      logger: undefined,
      syncFullHistory: false
    });

    store.bind(cliente.ev);

    // EVENTOS DE CONEXÃO
    cliente.ev.on("connection.update", async (atualizacao) => {
      const { connection, qr, lastDisconnect } = atualizacao;

      if (qr) {
        state.qrAtual = qr; state.conectado = false;
        state.qrDataUrl = await QRCode.toDataURL(qr, { width: 300 });
        console.log("🔄 NOVO QR CODE GERADO! Acesse a página /qr para ler.");
      }

      if (connection === "open") {
        state.conectado = true; state.qrAtual = null; state.qrDataUrl = null;
        console.log("✅=================================");
        console.log("✅ BOT CONECTADO E 100% FUNCIONAL!");
        console.log("✅ RODANDO NO RENDER 24H POR DIA!");
        console.log("✅=================================");
        await delay(3000);
        await cliente.sendMessage(CONFIG.dono_numero, { text: "🤖 *BOT LIGADO E FUNCIONANDO!* 🚀" });
      }

      if (connection === "close") {
        const motivo = new Boom(lastDisconnect?.error).output.statusCode;
        state.conectado = false;
        if (motivo !== DisconnectReason.loggedOut) {
          console.log("🔄 Tentando reconectar em 5s...");
          setTimeout(() => conectarWhatsApp(), 5000);
        } else {
          state.ultimoErro = "DESLOGADO! Apague pasta auth e reinicie.";
        }
      }
    });

    cliente.ev.on("creds.update", saveCreds);

    // RECEBER MENSAGENS
    cliente.ev.on("messages.upsert", async (evento) => {
      const msg = evento.messages[0];
      if (!msg?.key?.remoteJid || !msg?.message) return;
      
      const conteudo = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
      if (!conteudo) return;

      await processarMensagem(cliente, msg, msg.key.remoteJid, conteudo);
    });

  } catch (erro) {
    console.error("❌ ERRO CONEXÃO:", erro);
    setTimeout(() => conectarWhatsApp(), 10000);
  }
}

// ─── INICIAR TUDO ────────────────────────────────────────────────────────────
async function iniciarTudo() {
  console.log("🚀 INICIANDO IPTV FAMILY - FFTV");
  iniciarServidor(3000); // Liga servidor web
  await conectarWhatsApp(); // Liga WhatsApp
}

iniciarTudo();

// TRATAMENTO DE ERROS
process.on("unhandledRejection", (e) => console.error("ERRO:", e));
process.on("uncaughtException", (e) => console.error("ERRO:", e));
