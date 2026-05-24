import { getAuth } from '@/lib/auth'

export async function GET(req: Request) {
  const { prisma } = await import('@/lib/prisma')
  const auth = getAuth(req)
  const { searchParams } = new URL(req.url)
  const outletId = searchParams.get('outletId')

  try {
    const where: any = {
      outlet: {
        tenantId: auth.tenantId,
      },
    }

    if (outletId) {
      where.outletId = outletId
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formatted = transactions.map((t) => ({
      id: t.id,
      outletId: t.outletId,
      amount: Number(t.amount),
      status: t.status === 'SUCCESS' ? 'success' : t.status === 'PENDING' ? 'pending' : 'failed',
      paymentMethod: t.paymentMethod,
      createdAt: t.createdAt.toISOString(),
    }))

    return Response.json(formatted)
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    return Response.json([], { status: 500 })
  }
}
