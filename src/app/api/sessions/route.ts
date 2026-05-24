import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth'

export async function GET(req: Request) {
  const auth = getAuth(req)

  try {
    const { searchParams } = new URL(req.url)
    const outletId = searchParams.get('outletId')

    const where: any = {
      outlet: {
        tenantId: auth.tenantId,
      },
    }

    if (outletId) {
      where.outletId = outletId
    }

    const sessions = await prisma.sessionPhoto.findMany({
      where,
      select: {
        id: true,
        outletId: true,
        sessionCode: true,
        photos: true,
        gifUrl: true,
        newspaperUrl: true,
        totalPrice: true,
        paymentMethod: true,
        paymentStatus: true,
        voucherCode: true,
        galleryCode: true,
        status: true,
        createdAt: true,
        completedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formatted = sessions.map((s) => ({
      id: s.id,
      outletId: s.outletId,
      sessionCode: s.sessionCode,
      photoCount: Array.isArray(s.photos) ? s.photos.length : 0,
      photos: s.photos,
      gifUrl: s.gifUrl,
      newspaperUrl: s.newspaperUrl,
      totalPrice: Number(s.totalPrice),
      paymentMethod: s.paymentMethod,
      paymentStatus: s.paymentStatus,
      voucherCode: s.voucherCode,
      galleryCode: s.galleryCode,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      completedAt: s.completedAt?.toISOString() || null,
    }))

    return Response.json(formatted)
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    return Response.json([], { status: 500 })
  }
}
