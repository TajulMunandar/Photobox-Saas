// ============================================
// WhatsApp Notification API Route
// Triggered after photo session completes
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { sendGalleryNotification, sendPaymentConfirmation } from '@/lib/whatsapp-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      phoneNumber, 
      outletName, 
      galleryCode, 
      galleryUrl, 
      photoCount,
      type = 'gallery', // 'gallery' or 'payment'
      amount,
      sessionCode 
    } = body

    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Check if offline - queue for later
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Store in localStorage for offline queue
      if (typeof localStorage !== 'undefined') {
        const queue = JSON.parse(localStorage.getItem('wa-queue') || '[]')
        queue.push({
          phoneNumber,
          outletName,
          galleryCode,
          galleryUrl,
          photoCount,
          type,
          amount,
          sessionCode,
          timestamp: Date.now(),
        })
        localStorage.setItem('wa-queue', JSON.stringify(queue))
        console.log('[WhatsApp] Added to offline queue')
      }
      
      return NextResponse.json({
        success: true,
        queued: true,
        message: 'Message queued for offline delivery',
      })
    }

    // Send based on type
    let result

    if (type === 'payment' && amount && sessionCode) {
      result = await sendPaymentConfirmation({
        phoneNumber,
        outletName: outletName || 'SnapNext Booth',
        amount,
        sessionCode,
      })
    } else {
      result = await sendGalleryNotification({
        phoneNumber,
        outletName: outletName || 'SnapNext Booth',
        galleryCode: galleryCode || '',
        galleryUrl: galleryUrl || '',
        photoCount,
      })
    }

    if (result.success) {
      console.log('[WhatsApp] Message sent:', result.messageId)
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      })
    }

    return NextResponse.json({
      success: false,
      error: result.error,
    })
  } catch (error) {
    console.error('[WhatsApp API] Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// ============================================
// Process Offline Queue (called when back online)
// ============================================

export async function PUT(request: NextRequest) {
  try {
    // This endpoint is called by the client when they come back online
    // It processes any queued WhatsApp messages
    
    // For server-side processing, we'd need to store queue in database
    // For now, return success - client will handle local queue
    
    return NextResponse.json({
      success: true,
      message: 'Queue processing endpoint ready',
    })
  } catch (error) {
    console.error('[WhatsApp Queue] Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}