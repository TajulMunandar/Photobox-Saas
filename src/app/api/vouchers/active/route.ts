export async function GET(req: Request) {
  const { prisma } = await import('@/lib/prisma')
  const url = new URL(req.url)
  const outletId = url.searchParams.get('outletId')

  if (!outletId) {
    return Response.json({ message: 'outletId required' }, { status: 400 })
  }

  try {
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
      select: { tenantId: true },
    })

    if (!outlet) {
      return Response.json([], { status: 200 })
    }

     const vouchers = await prisma.voucher.findMany({
       where: {
         tenantId: outlet.tenantId,
         isActive: true,
         validUntil: { gte: new Date() },
       },
       orderBy: { createdAt: 'desc' },
     })

     return Response.json(vouchers.map(v => ({
       id: v.id,
       code: v.code,
       discountType: v.type === 'PERCENTAGE' ? 'percentage' : 'fixed',
       discountValue: Number(v.value),
       minPurchase: Number(v.minOrder),
       isActive: v.isActive,
       validUntil: v.validUntil.toISOString(),
       usedCount: v.usedCount,
       maxUses: v.maxUses,
     })))
  } catch (err) {
    console.error(err)
    return Response.json([], { status: 500 })
  }
}
