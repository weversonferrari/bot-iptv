// ✅ LISTA DE SERVIDORES DO PAINEL FFTV
export const SERVIDORES = [
  "https://ff-tv.ryzen.fun",      // Servidor Principal
  "https://azonixplay.sigma.vin", // Servidor Reserva 1
  "https://superodinplay.shop"    // Servidor Reserva 2
];

export const SERVIDOR_PRINCIPAL = SERVIDORES[0];
export const SERVIDOR_RESERVA = SERVIDORES[1];
export const DNS_PRINCIPAL = "http://super-eclipse.shop"; // DNS oficial do seu painel

export const CONFIG = {
  nome: "IPTV FAMILY",
  nome_dono: "Weverson",
  dono_numero: "5521980236044@s.whatsapp.net",

  // 📡 DADOS DE ACESSO AO PAINEL PRINCIPAL
  painel: {
    url: SERVIDOR_PRINCIPAL,
    usuario: "Weverson92#",
    senha: "Weverson93#",
    codigo_provedor: "TF44", // Código correto do seu provedor
  },

  // 🔗 LINK DE INDICAÇÃO / REVENDA
  link_indicacao_revenda: "https://ff-tv.ryzen.fun/rs/4shjEzt5zc/211e8d9b5ad8",

  // 📡 DADOS DE ACESSO AO PAINEL RESERVA 1
  painel_reserva: {
    url: SERVIDOR_RESERVA,
    usuario: "Weverson92#",
    senha: "Weverson93#",
    codigo_provedor: "TF44",
  },

  // 📡 DADOS DE ACESSO AO PAINEL RESERVA 2
  painel_reserva2: {
    url: SERVIDORES[2],
    usuario: "Weverson1@",
    senha: "Weverson12@",
    codigo_provedor: "2613782",
  },

  // 📦 PLANOS E VALORES (✅ PROMOÇÃO 25,00 / NORMAL 35,00)
  planos: {
    mensal_1tela: { 
      valor_promocao: 25.0, // ✅ Valor para novos clientes / 1º mês
      valor_normal: 35.0,   // ✅ Valor normal após o 1º mês
      nome: "Mensal 1 Tela", 
      dias: 30 
    },
    mensal_2telas: { valor: 60.0, nome: "Mensal 2 Telas", dias: 30 },
    trimestral: { valor: 94.9, nome: "Trimestral", dias: 90 },
    semestral: { valor: 190.0, nome: "Semestral", dias: 180 },
    anual: { valor: 300.0, nome: "Anual", dias: 365 },
    renovacao: { valor: 35.0, nome: "Renovação 1 Tela", dias: 30 },
    revenda: { valor: 50.0, nome: "Pacote Revendedor", dias: 30 },
  },

  // 💳 DADOS DE PAGAMENTO MERCADO PAGO
  mercado_pago_token:
    process.env["MERCADO_PAGO_TOKEN"] ||
    "APP_USR-1676815975878482-051514-f400a23f15ffe521f624038124e83022-544855967",

  mp_webhook_secret: process.env["MP_WEBHOOK_SECRET"] || "",

  // ⏰ HORÁRIO DE ATENDIMENTO / SUPORTE
  suporte: {
    seg_sex: { inicio: 9, fim: 17 },
    sabado: { inicio: 10, fim: 14 },
  },

  // 🛡️ PROTEÇÃO CONTRA EXCESSO DE MENSAGENS
  flood: {
    max_mensagens: 8,
    janela_segundos: 60,
    bloqueio_minutos: 5,
  },

  // 🧪 CONFIGURAÇÕES DO TESTE GRÁTIS (✅ 24h para pedir novo)
  teste: {
    dias_validade: 1,
    quantidade_conexoes: 1,
    tempo_espera_novo_teste_horas: 24, // ✅ Regra que você pediu
    mensagens: {
      processando: "⏳ Criando seu teste na FFTV, aguarde um instante...",
      erro: "❌ Infelizmente não consegui criar automaticamente. Já avisei o suporte, em breve criam manualmente para você!",
      ja_pediu: "⚠️ Você já solicitou um teste recentemente! Aguarde 24 horas para pedir um novo, ou entre em contato com nosso suporte.",
      modelo: `
✅ *Usuário:* {usuario}
✅ *Senha:* {senha}
📦 *Plano:* TESTE
🗓️ *Vencimento:* {vencimento}
📶 *Conexões:* {conexoes}

*Provedor:* TF44 • *aplicativo parceiro:* Blessed player • compatível com Samsung LG SMART Android IOS IPHONE e ROKU

━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 *Link (M3U):* {link_m3u}
🟢 *Link Curto (M3U):* {link_curto_m3u}

🟡 *Link (HLS):* {link_hls}
🟡 *Link Curto (HLS):* {link_curto_hls}

🔴 *Link (SSIPTV):* {link_ssiptv}

🟠 *DNS XCIPTV:* ${DNS_PRINCIPAL}
🟠 *DNS SMARTERS:* ${DNS_PRINCIPAL}

📺 *DNS STB / SmartUp:* XXXXX
📺 *WebPlayer:* http://XXXXXX/

✅ *PARA ANDROID:*
- PLAYSTORE
- EM BREVE

✅ *App EM APK (LINK DIRETO):*
*DOWNLOAD:* https://bit.ly/XXXXX

Atenciosamente,
Weverson
      `.trim()
    }
  }
};
