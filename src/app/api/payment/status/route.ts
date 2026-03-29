// ============================================
// Payment Status Check API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentGateway } from '@/lib/payment/adapter'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const transactionRef = searchParams.get('ref')

    if (!transactionRef) {
      return NextResponse.json(
        { success: false, error: 'Transaction reference is required' },
        { status: 400 }
      )
    }

    // Get payment gateway
    const gateway = getPaymentGateway('doku')

    // Check payment status
    const result = await gateway.checkPayment(transactionRef)

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status,
        paidAt: result.paidAt?.toISOString(),
      })
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Failed to check payment status' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Payment status API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
