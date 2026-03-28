// ============================================
// Payment Gateway Adapter Pattern
// Supports: Tokopay, Midtrans, Doku, QRIS
// ============================================

// Base Interface
export interface PaymentGateway {
  createPayment(params: PaymentParams): Promise<PaymentResult>
  checkPayment(transactionRef: string): Promise<PaymentStatusResult>
  refund(transactionRef: string, amount?: number): Promise<RefundResult>
}

export interface PaymentParams {
  amount: number
  orderId: string
  customerEmail?: string
  customerPhone?: string
  description?: string
  callbackUrl?: string
}

export interface PaymentResult {
  success: boolean
  transactionRef?: string
  paymentUrl?: string
  qrisString?: string // For QRIS
  expiresAt?: Date
  error?: string
}

export interface PaymentStatusResult {
  success: boolean
  status: 'pending' | 'success' | 'failed' | 'refunded'
  paidAt?: Date
  error?: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
  error?: string
}

// ============================================
// Tokopay Adapter
// ============================================

export class TokopayAdapter implements PaymentGateway {
  private merchantId: string
  private apiKey: string
  private secretKey: string
  private baseUrl: string

  constructor() {
    this.merchantId = process.env.TOKOPAY_MERCHANT_ID || ''
    this.apiKey = process.env.TOKOPAY_API_KEY || ''
    this.secretKey = process.env.TOKOPAY_SECRET_KEY || ''
    this.baseUrl = process.env.TOKOPAY_IS_PRODUCTION === 'true' 
      ? 'https://tripay.co.id' 
      : 'https://tripay.co.id'
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    try {
      const signature = this.generateSignature(params.orderId, params.amount)
      
      const response = await fetch(`${this.baseUrl}/api/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          merchant_ref: params.orderId,
          method: 'QRIS_TOKOPAY',
          amount: params.amount,
          customer_name: params.customerEmail?.split('@')[0] || 'Customer',
          customer_email: params.customerEmail || '',
          customer_phone: params.customerPhone || '',
          description: params.description || 'Photo Booth Payment',
          callback_url: params.callbackUrl,
          signature,
        }),
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          transactionRef: data.reference,
          qrisString: data.qr_string,
          expiresAt: new Date(data.expired_time),
        }
      }

      return { success: false, error: data.message }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async checkPayment(transactionRef: string): Promise<PaymentStatusResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payment/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ reference: transactionRef }),
      })

      const data = await response.json()

      return {
        success: true,
        status: data.status === 'PAID' ? 'success' : data.status === 'EXPIRED' ? 'failed' : 'pending',
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      }
    } catch (error) {
      return { success: false, error: String(error), status: 'failed' }
    }
  }

  async refund(transactionRef: string, amount?: number): Promise<RefundResult> {
    // Implement refund logic
    return { success: false, error: 'Refund not implemented for Tokopay' }
  }

  private generateSignature(orderId: string, amount: number): string {
    const crypto = require('crypto')
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(`${this.merchantId}${orderId}${amount}`)
      .digest('hex')
  }
}

// ============================================
// Midtrans Adapter
// ============================================

export class MidtransAdapter implements PaymentGateway {
  private serverKey: string
  private clientKey: string
  private isProduction: boolean

  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || ''
    this.isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
  }

  getClientKey(): string {
    return this.clientKey
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    try {
      const orderId = `${params.orderId}-${Date.now()}`
      
      const response = await fetch(
        `${this.isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'}/snap/v1/transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: orderId,
              gross_amount: params.amount,
            },
            payment_type: 'qris',
            qris: {
              acquirer: 'qris',
            },
            customer_details: {
              email: params.customerEmail,
              phone: params.customerPhone,
            },
          }),
        }
      )

      const data = await response.json()

      if (data.token) {
        return {
          success: true,
          transactionRef: orderId,
          paymentUrl: data.redirect_url,
          qrisString: data.qr_string,
        }
      }

      return { success: false, error: data.status_message }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async checkPayment(transactionRef: string): Promise<PaymentStatusResult> {
    try {
      const response = await fetch(
        `${this.isProduction ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'}/v2/${transactionRef}/status`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
          },
        }
      )

      const data = await response.json()

      return {
        success: true,
        status: data.transaction_status === 'settlement' ? 'success' : 
               data.transaction_status === 'expire' ? 'failed' : 'pending',
        paidAt: data.settlement_time ? new Date(data.settlement_time) : undefined,
      }
    } catch (error) {
      return { success: false, error: String(error), status: 'failed' }
    }
  }

  async refund(transactionRef: string, amount?: number): Promise<RefundResult> {
    try {
      const response = await fetch(
        `${this.isProduction ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'}/v2/${transactionRef}/refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
          },
          body: JSON.stringify({
            refund_amount: amount,
          }),
        }
      )

      const data = await response.json()

      return {
        success: data.status_code === '200',
        refundId: data.refund_id,
        error: data.status_message,
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}

// ============================================
// Doku Adapter
// ============================================

export class DokuAdapter implements PaymentGateway {
  private merchantId: string
  private secretKey: string
  private isProduction: boolean

  constructor() {
    this.merchantId = process.env.DOKU_MERCHANT_ID || ''
    this.secretKey = process.env.DOKU_SECRET_KEY || ''
    this.isProduction = process.env.DOKU_IS_PRODUCTION === 'true'
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    try {
      const orderId = `ORD-${params.orderId}-${Date.now()}`
      
      const response = await fetch(
        `${this.isProduction ? 'https://api.doku.com' : 'https://api-sandbox.doku.com'}/checkout/v1/payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Merchant-Id': this.merchantId,
          },
          body: JSON.stringify({
            order: {
              order_id: orderId,
              amount: params.amount,
              currency: 'IDR',
            },
            payment: {
              payment_method: 'QRIS',
              payment_channel: 'QRIS',
            },
            customer: {
              email: params.customerEmail,
              phone: params.customerPhone,
            },
          }),
        }
      )

      const data = await response.json()

      if (data.response_code === '0000') {
        return {
          success: true,
          transactionRef: data.order_id,
          qrisString: data.qr_string,
          expiresAt: new Date(data.expiry_time),
        }
      }

      return { success: false, error: data.response_message }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async checkPayment(transactionRef: string): Promise<PaymentStatusResult> {
    // Implement status check
    return { success: false, error: 'Not implemented', status: 'pending' }
  }

  async refund(transactionRef: string, amount?: number): Promise<RefundResult> {
    return { success: false, error: 'Not implemented' }
  }
}

// ============================================
// QRIS Direct (Dynamic QRIS Generator)
// ============================================

export class QrisAdapter implements PaymentGateway {
  private merchantId: string
  private apiKey: string

  constructor() {
    this.merchantId = process.env.QRIS_MERCHANT_ID || ''
    this.apiKey = process.env.QRIS_API_KEY || ''
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    try {
      // Generate dynamic QRIS string
      const qrisString = this.generateDynamicQris(params.amount, params.orderId)
      
      // Set expiry (typically 30 minutes for QRIS)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

      return {
        success: true,
        transactionRef: params.orderId,
        qrisString,
        expiresAt,
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  async checkPayment(transactionRef: string): Promise<PaymentStatusResult> {
    // In production, you'd poll the payment provider
    // For now, return pending
    return { success: true, status: 'pending' }
  }

  async refund(transactionRef: string, amount?: number): Promise<RefundResult> {
    return { success: false, error: 'QRIS does not support refunds directly' }
  }

  private generateDynamicQris(amount: number, orderId: string): string {
    // QRIS MPM format: 00{ID}01{Amount}02{MerchantID}03{OrderID}...
    // This is a simplified version - in production use proper QRIS generation
    const merchantId = this.merchantId.padStart(15, '0')
    const amountStr = String(amount).padStart(12, '0')
    const orderIdStr = orderId.slice(0, 20)
    
    // Build QRIS string (simplified)
    const qris = `000201010211${merchantId}52040000${amountStr}5303158${orderIdStr}6304`
    
    // Calculate CRC16
    const crc = this.calculateCRC(qris)
    
    return qris + crc
  }

  private calculateCRC(data: string): string {
    // Simple CRC16 calculation for QRIS
    let crc = 0xFFFF
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i)
      for (let j = 0; j < 8; j++) {
        crc = (crc >> 1) ^ (crc & 1 ? 0xA001 : 0)
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0')
  }
}

// ============================================
// Payment Factory
// ============================================

export type PaymentProvider = 'tokopay' | 'midtrans' | 'doku' | 'qris'

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function getPaymentGateway(provider: PaymentProvider): PaymentGateway {
  if (isDemoMode) {
    return new DemoPaymentAdapter()
  }
  
  switch (provider) {
    case 'tokopay':
      return new TokopayAdapter()
    case 'midtrans':
      return new MidtransAdapter()
    case 'doku':
      return new DokuAdapter()
    case 'qris':
      return new QrisAdapter()
    default:
      throw new Error(`Unknown payment provider: ${provider}`)
  }
}

// ============================================
// Demo Mode Payment Adapter (Mock)
// ============================================

class DemoPaymentAdapter implements PaymentGateway {
  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    // In demo mode, immediately return success
    return {
      success: true,
      transactionRef: `DEMO-${params.orderId}-${Date.now()}`,
      paymentUrl: undefined,
      qrisString: `demo://qris?amount=${params.amount}&order=${params.orderId}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    }
  }

  async checkPayment(transactionRef: string): Promise<PaymentStatusResult> {
    // In demo mode, always return success
    return {
      success: true,
      status: 'success',
      paidAt: new Date(),
    }
  }

  async refund(transactionRef: string, amount?: number): Promise<RefundResult> {
    return {
      success: true,
      refundId: `REFUND-${transactionRef}`,
    }
  }
}