import { Resend } from "resend";
import { serverEnv } from "@/env";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const resend = new Resend(serverEnv.RESEND_API_KEY);

interface OrderDetails {
  orderId: string;
  productTitle: string;
  finalPrice: number;
}

interface UserDetails {
  name: string;
  email: string;
}

const TEMPLATE_STYLE = `
  font-family: 'Inter', sans-serif, -apple-system;
  color: #1d1d1f;
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  border-radius: 20px;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
`;

const LOGO_HTML = `
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px;">
      BPlen <span style="color: #ff2c8d;">HUB</span>
    </h1>
  </div>
`;

/**
 * 📧 E-mail 1: Compra Solicitada
 * Disparado quando o usuário insere os dados e o botão Pagar é clicado.
 */
export async function sendOrderRequestedEmail(user: UserDetails, order: OrderDetails) {
  try {
    await resend.emails.send({
      from: "Equipe Financeira BPlen <financeiro@bplen.com>",
      to: user.email,
      subject: `Sua solicitação de compra foi recebida - ${order.productTitle}`,
      html: `
        <div style="${TEMPLATE_STYLE}">
          ${LOGO_HTML}
          <h2 style="color: #1d1d1f; margin-bottom: 10px;">Olá, ${user.name || "Membro"}!</h2>
          <p style="font-size: 15px; color: #52525B; line-height: 1.6;">
            Recebemos a sua solicitação de compra para a <b>${order.productTitle}</b>. 
            Neste exato momento, nossa plataforma está se comunicando de forma segura com sua administradora de cartão para efetivar a autorização do pagamento.
          </p>

          <div style="background: #F5F7FA; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #9CA3AF; text-transform: uppercase; font-weight: bold;">Resumo do Pedido</p>
            <p style="margin: 5px 0; font-size: 14px;"><b>Serviço:</b> ${order.productTitle}</p>
            <p style="margin: 5px 0; font-size: 14px;"><b>Valor:</b> R$ ${order.finalPrice.toFixed(2)}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #52525B;"><b>Nº Pedido:</b> #${order.orderId.substring(0, 8).toUpperCase()}</p>
          </div>

          <p style="font-size: 14px; color: #52525B; line-height: 1.6;">
            Você receberá um novo e-mail assim que o pagamento for aprovado e seus acessos forem liberados.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;" />
          <p style="font-size: 11px; color: #9CA3AF; text-align: center;">
            Este é um e-mail automático. BPlen - Desenvolvimento Humano e Estratégia.
          </p>
        </div>
      `
    });
    console.log(`✉️ [E-mail] "Compra Solicitada" enviado para ${user.email}`);
  } catch (error) {
    console.error("❌ ERRO ao enviar E-mail 1 (Compra Solicitada):", error);
  }
}

/**
 * 📧 E-mail 2: Compra com Sucesso
 * Disparado pelo Webhook do Mercado Pago quando status = 'approved'.
 */
export async function sendPaymentApprovedEmail(user: UserDetails, order: OrderDetails, paymentId: string) {
  try {
    const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    await resend.emails.send({
      from: "Equipe Financeira BPlen <financeiro@bplen.com>",
      to: user.email,
      subject: `Pagamento Aprovado! Recibo: ${order.productTitle}`,
      html: `
        <div style="${TEMPLATE_STYLE}">
          ${LOGO_HTML}
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; background: #Edfdf4; color: #16a34a; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; letter-spacing: 1px;">PAGAMENTO CONFIRMADO</span>
          </div>
          
          <h2 style="color: #1d1d1f; margin-bottom: 10px;">Aqui está o seu recibo, ${user.name || "Membro"}!</h2>
          <p style="font-size: 15px; color: #52525B; line-height: 1.6;">
            Temos ótimas notícias! O pagamento da sua contratação foi <b>aprovado com sucesso</b> pelo Mercado Pago.
          </p>

          <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <p style="margin: 0 0 15px 0; font-size: 12px; color: #9CA3AF; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Detalhes da Transação</p>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
               <span style="font-size: 14px; color: #52525B;">Data</span>
               <span style="font-size: 14px; font-weight: bold;">${today}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
               <span style="font-size: 14px; color: #52525B;">Transação MP</span>
               <span style="font-size: 14px; font-weight: bold;">#${paymentId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
               <span style="font-size: 14px; color: #52525B;">Serviço</span>
               <span style="font-size: 14px; font-weight: bold;">${order.productTitle}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e5e7eb;">
               <span style="font-size: 16px; color: #1d1d1f; font-weight: 900;">Total Pago</span>
               <span style="font-size: 16px; font-weight: 900; color: #ff2c8d;">R$ ${order.finalPrice.toFixed(2)}</span>
            </div>
          </div>

          <p style="font-size: 14px; color: #52525B; line-height: 1.6;">
            A Nota Fiscal de serviço será gerada e enviada automaticamente para este e-mail dentro dos parâmetros legais da nossa prefeitura. O seu acesso ao BPlen HUB já foi processado!
          </p>
          
          <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;" />
          <p style="font-size: 11px; color: #9CA3AF; text-align: center;">
            BPlen HUB — Inteligência em Gestão e Desenvolvimento<br/>
            Departamento Financeiro | financeiro@bplen.com
          </p>
        </div>
      `
    });
    console.log(`✉️ [E-mail] "Pagamento Aprovado" enviado para ${user.email}`);
  } catch (error) {
    console.error("❌ ERRO ao enviar E-mail 2 (Pagamento Sucesso):", error);
  }
}

/**
 * 📧 E-mail 3: Serviço Liberado
 * Disparado pelo grantServiceEntitlement após atualizar o Firestore.
 */
export async function sendServiceGrantedEmail(user: UserDetails, productTitle: string) {
  try {
    await resend.emails.send({
      from: "Comunidade BPlen <hub@bplen.com>",
      to: user.email,
      subject: `Acesso Liberado! Sua jornada com a ${productTitle} começou 🚀`,
      html: `
        <div style="${TEMPLATE_STYLE}">
          ${LOGO_HTML}
          
          <h2 style="color: #ff2c8d; margin-bottom: 10px;">Boas-vindas à sua nova jornada!</h2>
          <p style="font-size: 16px; color: #1d1d1f; font-weight: bold;">Olá, ${user.name || "Membro"}!</p>
          
          <p style="font-size: 15px; color: #3F3F46; line-height: 1.7;">
            Seu acesso ao mapeamento <b>${productTitle}</b> acabou de ser oficialmente destrancado na nossa plataforma! 
            Estamos muito felizes em ter você a bordo desse novo ciclo de evolução.
          </p>

          <div style="background: rgba(255, 44, 141, 0.05); padding: 25px; border-radius: 16px; border: 1px solid rgba(255, 44, 141, 0.1); margin: 30px 0; text-align: center;">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #1d1d1f; font-weight: bold;">Tudo pronto. Seu Dashboard te espera.</p>
            <a href="https://bplenhub.com/hub/membro/dashboard" style="display: inline-block; background-color: #ff2c8d; color: white; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-weight: 900; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(255, 44, 141, 0.4);">
              Acessar Módulo
            </a>
          </div>

          <p style="font-size: 13px; color: #52525B; line-height: 1.6;">
            <b>Dica de Ouro:</b> Faça login na plataforma BPlen HUB e procure pela aba "Serviços". Toda a trilha de onboard já está personalizada e aguardando suas respostas.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;" />
          <p style="font-size: 11px; color: #9CA3AF; text-align: center;">
            Para qualquer dúvida técnica, basta responder a este e-mail.<br/>
            Comunidade BPlen HUB
          </p>
        </div>
      `
    });
    console.log(`✉️ [E-mail] "Acesso Liberado" enviado para ${user.email}`);
  } catch (error) {
    console.error("❌ ERRO ao enviar E-mail 3 (Serviço Liberado):", error);
  }
}
