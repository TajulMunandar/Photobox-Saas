// ============================================
// WhatsApp Service - Fonnte/Wablas API Integration
// ============================================

export interface WhatsAppMessage {
  to: string
  message: string
  imageUrl?: string
}

export interface WhatsAppResult {
  success: boolean
  messageId?: string
  error?: string
}

// Configuration
const FONNTE_API_URL = 'https://api.fonnte.com/send'
const WABLAS_API_URL = 'https://wablas.com/api/v2/send-message'
const WANOTIF_API_URL = 'https://wanotif.com/api/send-message'

// Get config from environment
const FONNTE_TOKEN = process.env.FONNTE_API_TOKEN || ''
const WABLAS_TOKEN = process.env.WABLAS_API_TOKEN || ''
const WANOTIF_TOKEN = process.env.WANOTIF_API_TOKEN || 'eJq5ydqkSzHDYydRdE8X'
const DEFAULT_SENDER = process.env.WHATSAPP_SENDER_NUMBER || ''

// ============================================
// Send WhatsApp Message via Fonnte (Primary)
// ============================================

export async function sendWhatsAppFonnte(message: WhatsAppMessage): Promise<WhatsAppResult> {
  if (!FONNTE_TOKEN) {
    console.error('Fonnte API token not configured')
    return { success: false, error: 'Fonnte API not configured' }
  }

  try {
    // Format phone number (remove +62 -> 62)
    const formattedPhone = message.to.replace(/^\+62/, '0').replace(/^62/, '0')

    const response = await fetch(FONNTE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message.message,
        imageUrl: message.imageUrl,
      }),
    })

    const data = await response.json()

    if (data.status === true || data.result?.[0]?.status === 'success') {
      return {
        success: true,
        messageId: data.result?.[0]?.id || data.id,
      }
    }

    return {
      success: false,
      error: data.message || 'Failed to send WhatsApp message',
    }
  } catch (error) {
    console.error('Fonnte WhatsApp error:', error)
    return {
      success: false,
      error: String(error),
    }
  }
}

// ============================================
// Send WhatsApp Message via Wablas (Alternative)
// ============================================

export async function sendWhatsAppWablas(message: WhatsAppMessage): Promise<WhatsAppResult> {
  if (!WABLAS_TOKEN) {
    console.error('Wablas API token not configured')
    return { success: false, error: 'Wablas API not configured' }
  }

  try {
    // Format phone number
    const formattedPhone = message.to.replace(/^\+62/, '0').replace(/^62/, '0')

    const response = await fetch(WABLAS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': WABLAS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message.message,
        image: message.imageUrl,
      }),
    })

    const data = await response.json()

    if (data.data) {
      return {
        success: true,
        messageId: data.data[0]?.id,
      }
    }

    return {
      success: false,
      error: data.message || 'Failed to send WhatsApp message',
    }
  } catch (error) {
    console.error('Wablas WhatsApp error:', error)
    return {
      success: false,
      error: String(error),
    }
  }
}

// ============================================
// Send WhatsApp Message via Wanotif
// ============================================

export async function sendWhatsAppWanotif(message: WhatsAppMessage): Promise<WhatsAppResult> {
  if (!WANOTIF_TOKEN) {
    console.error('Wanotif API token not configured')
    return { success: false, error: 'Wanotif API not configured' }
  }

  try {
    // Format phone number (remove +62 -> 62, or keep 0 prefix)
    const formattedPhone = message.to.replace(/^\+62/, '62').replace(/^0/, '62')

    const response = await fetch(WANOTIF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': WANOTIF_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message.message,
        url: message.imageUrl,
      }),
    })

    const data = await response.json()

    if (data.status === true || data.status === 'success') {
      return {
        success: true,
        messageId: data.id || data.data?.id,
      }
    }

    return {
      success: false,
      error: data.message || 'Failed to send WhatsApp message',
    }
  } catch (error) {
    console.error('Wanotif WhatsApp error:', error)
    return {
      success: false,
      error: String(error),
    }
  }
}

// ============================================
// Unified Send Function (Auto-choose available provider)
// ============================================

export async function sendWhatsApp(message: WhatsAppMessage): Promise<WhatsAppResult> {
  // Try Wanotif first if configured (using provided token)
  if (WANOTIF_TOKEN) {
    const result = await sendWhatsAppWanotif(message)
    if (result.success) return result
  }

  // Try Fonnte if configured
  if (FONNTE_TOKEN) {
    return await sendWhatsAppFonnte(message)
  }

  // Try Wablas if configured
  if (WABLAS_TOKEN) {
    return await sendWhatsAppWablas(message)
  }

  // Demo mode - log but don't actually send
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    console.log('[DEMO] WhatsApp message would be sent:', message)
    return {
      success: true,
      messageId: `demo-${Date.now()}`,
    }
  }

  return {
    success: false,
    error: 'No WhatsApp provider configured (WANOTIF, FONNTE, or WABLAS)',
  }
}

// ============================================
// Photo Gallery Notification Template
// ============================================

export interface GalleryNotificationParams {
  phoneNumber: string
  outletName: string
  galleryCode: string
  galleryUrl: string
  photoCount?: number
}

export async function sendGalleryNotification(
  params: GalleryNotificationParams
): Promise<WhatsAppResult> {
  const message = `🎉 *Foto Kamu Sudah Jadi!*\n\n` +
    `Hai! Ini foto kamu dari *${params.outletName}* 📸\n\n` +
    `📊 ${params.photoCount || 4} foto telah siap\n\n` +
    `🔗 Klik link berikut untuk download:\n${params.galleryUrl}\n\n` +
    `📝 Atau masukkan kode: *${params.galleryCode}*\n\n` +
    `_Terima kasih sudah menggunakan SnapNext!_`

  return await sendWhatsApp({
    to: params.phoneNumber,
    message,
  })
}

// ============================================
// Payment Confirmation Template
// ============================================

export interface PaymentNotificationParams {
  phoneNumber: string
  outletName: string
  amount: number
  sessionCode: string
}

export async function sendPaymentConfirmation(
  params: PaymentNotificationParams
): Promise<WhatsAppResult> {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(params.amount)

  const message = `✅ *Pembayaran Berhasil!*\n\n` +
    `Hai! Pembayaran untuk sesi foto di *${params.outletName}* telah berhasil.\n\n` +
    `💰 Jumlah: *${formattedAmount}*\n` +
    `📋 Kode Sesi: ${params.sessionCode}\n\n` +
    `Silakan lanjut ke booth untuk mengambil foto! 📸`

  return await sendWhatsApp({
    to: params.phoneNumber,
    message,
  })
}