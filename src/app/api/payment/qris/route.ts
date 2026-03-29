// ============================================
// QRIS Payment API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentGateway } from '@/lib/payment/adapter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, orderId, customerPhone } = body

    if (!amount || !orderId) {
      return NextResponse.json(
        { success: false, error: 'Amount and orderId are required' },
        { status: 400 }
      )
    }

    // Get payment gateway (Doku by default)
    const gateway = getPaymentGateway('doku')

    // Create payment
    const result = await gateway.createPayment({
      amount,
      orderId,
      customerPhone,
      description: `SnapNext Photo Booth - ${orderId}`,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        qrString: result.qrisString,
        transactionRef: result.transactionRef,
        expiresAt: result.expiresAt?.toISOString(),
      })
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Failed to create payment' },
      { status: 500 }
    )
  } catch (error) {
    console.error('QRIS API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
