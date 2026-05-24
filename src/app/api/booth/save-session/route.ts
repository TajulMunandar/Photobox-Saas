import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { outletId, frameId, sessionCode, photos, totalPrice, paymentMethod, paymentRef, voucherCode, voucherDiscount, galleryCode } = body

    if (!outletId || !sessionCode || !galleryCode) {
      return Response.json({ message: 'outletId, sessionCode, galleryCode required' }, { status: 400 })
    }

    const existing = await prisma.sessionPhoto.findUnique({
      where: { sessionCode },
    })
    if (existing) {
      return Response.json({ id: existing.id, message: 'Session already exists' })
    }

    const session = await prisma.sessionPhoto.create({
      data: {
        outletId,
        frameId: frameId || null,
        sessionCode,
        status: 'COMPLETED',
        photos: photos || [],
        totalPrice: totalPrice || 0,
        paymentMethod: paymentMethod || null,
        paymentStatus: 'PAID',
        paymentRef: paymentRef || null,
        voucherCode: voucherCode || null,
        voucherDiscount: voucherDiscount || 0,
        galleryCode,
        completedAt: new Date(),
      },
    })

    if (totalPrice && paymentMethod) {
      await prisma.transaction.create({
        data: {
          outletId,
          sessionId: session.id,
          amount: totalPrice,
          paymentMethod,
          transactionRef: paymentRef || null,
          status: 'SUCCESS',
        },
      })
    }

    // Increment voucher usage if a voucher was applied
    if (voucherCode) {
      await prisma.voucher.update({
        where: { code: voucherCode },
        data: { usedCount: { increment: 1 } },
      })
    }

    return Response.json({ id: session.id, sessionCode })
  } catch (err) {
    console.error(err)
    return Response.json({ message: 'Failed to save session' }, { status: 500 })
  }
}
