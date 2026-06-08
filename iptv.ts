import axios from "axios";
import { CONFIG, SERVIDOR_PRINCIPAL, SERVIDOR_RESERVA } from "./config";
import { state } from "./web";

// ─── FUNÇÃO PARA VERIFICAR SE JÁ USOU TESTE ─────────────────────────────────
export function jaUsouTeste(telefone: string): boolean {
  const agora = Date.now();
  const ultimoPedido = state.usuariosTeste[telefone];

  if (!ultimoPedido) return false;

  // Calcula quanto tempo passou
  const horasPassadas = (agora - ultimoPedido.getTime()) / (1000 * 60 * 60);
  return horasPassadas < CONFIG.teste.tempo_espera_novo_teste_horas;
}

// ─── FUNÇÃO PRINCIPAL: CRIAR TESTE NA API DO FFTV ──────────────────────────
export async function criarTesteReal(telefoneCliente: string) {
  try {
    // Dados para enviar para API
    const dadosApi = {
      usuario: CONFIG.painel.usuario,
      senha: CONFIG.painel.senha,
      acao: "criar_teste",
      provedor: CONFIG.painel.codigo_provedor,
      dias: CONFIG.teste.dias_validade,
      conexoes: CONFIG.teste.quantidade_conexoes,
      nome: "Cliente Teste",
      telefone: telefoneCliente.replace("@s.whatsapp.net", ""),
      dns_padrao: CONFIG.DNS_PRINCIPAL
    };

    // TENTA NO SERVIDOR PRINCIPAL
    const urlApiPrincipal = `${SERVIDOR_PRINCIPAL}/api.php`;
    try {
      const resposta = await axios.post(urlApiPrincipal, dadosApi, { timeout: 15000 });
      
      if (resposta.data && resposta.data.sucesso) {
        // Salva que esse cliente já pediu
        state.usuariosTeste[telefoneCliente] = new Date();
        return resposta.data.dados;
      }
      // Se deu erro de provedor, tenta reserva
      if (resposta.data?.erro?.includes("provedor")) throw new Error("Usar reserva");

    } catch (erroPrincipal) {
      console.log("⚠️ Servidor principal fora, tentando reserva...");
      
      // TENTA NO SERVIDOR RESERVA
      const urlApiReserva = `${SERVIDOR_RESERVA}/api.php`;
      const dadosReserva = {...dadosApi, usuario: CONFIG.painel_reserva.usuario, senha: CONFIG.painel_reserva.senha, provedor: CONFIG.painel_reserva.codigo_provedor };
      
      const respostaReserva = await axios.post(urlApiReserva, dadosReserva, { timeout: 15000 });
      if (respostaReserva.data && respostaReserva.data.sucesso) {
        state.usuariosTeste[telefoneCliente] = new Date();
        return respostaReserva.data.dados;
      }
    }

    return { reply: "erro", erro: "Não foi possível conectar em nenhum servidor" };

  } catch (erro) {
    console.error("❌ ERRO NA API:", erro);
    return { reply: "erro", erro: String(erro) };
  }
}
