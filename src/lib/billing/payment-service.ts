/**
 * PsiApp - Motor Financeiro e Gateway de Pagamentos Clínicos
 * Suporte a faturamento SaaS de assinaturas e cobrança direta de consultas via Pix Dinâmico e Split.
 */

export interface PixChargeRequest {
  appointmentId: string;
  patientId: string;
  patientName: string;
  psychologistId: string;
  psychologistName: string;
  amount: number; // Em reais (ex: 200.00)
  description: string;
}

export interface PixChargeResponse {
  txId: string;
  qrCodeUrl: string;
  copiaECola: string;
  amount: number;
  expiresAt: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
}

export interface PaymentReceipt {
  receiptNumber: string;
  appointmentId: string;
  amount: number;
  patientName: string;
  psychologistName: string;
  psychologistCrp: string;
  issuedAt: string;
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'TRANSFER';
  authCode: string;
}

export const PaymentService = {
  /**
   * Gera uma cobrança Pix Dinâmica com QR Code e código copia-e-cola.
   */
  generatePixCharge(request: PixChargeRequest): PixChargeResponse {
    const txId = `PSI-TX-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos

    // Payload Pix Padrão BACEN (BRCode Simulado)
    const sanitizedAmount = request.amount.toFixed(2);
    const copiaECola = `00020101021226580014br.gov.bcb.pix0136${txId}520400005303986540${sanitizedAmount.length}${sanitizedAmount}5802BR5925${request.psychologistName.substring(0, 25)}6009SAO PAULO62070503***6304ABCD`;

    // Gerador de QR Code URL usando API segura pública de visualização rápida
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(copiaECola)}`;

    return {
      txId,
      qrCodeUrl,
      copiaECola,
      amount: request.amount,
      expiresAt,
      status: 'PENDING'
    };
  },

  /**
   * Emite um recibo digital profissional em conformidade com o CFP.
   */
  generateReceipt(
    appointmentId: string,
    patientName: string,
    psychologistName: string,
    psychologistCrp: string,
    amount: number
  ): PaymentReceipt {
    const now = new Date();
    const receiptNumber = `REC-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const authCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    return {
      receiptNumber,
      appointmentId,
      amount,
      patientName,
      psychologistName,
      psychologistCrp,
      issuedAt: now.toISOString(),
      paymentMethod: 'PIX',
      authCode
    };
  },

  /**
   * Calcula o split de pagamento entre a clínica e o psicólogo.
   */
  calculatePaymentSplit(amount: number, commissionPercent = 20) {
    const platformFee = Number((amount * (commissionPercent / 100)).toFixed(2));
    const professionalAmount = Number((amount - platformFee).toFixed(2));
    return {
      totalAmount: amount,
      platformFee,
      professionalAmount,
      commissionPercent
    };
  }
};
