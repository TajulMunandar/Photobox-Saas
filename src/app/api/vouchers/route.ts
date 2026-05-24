import { getAuth } from '@/lib/auth' // nanti bikin


// FUNGSI GET DATA vouchers
export async function GET(req: Request) {
  const { prisma } = await import('@/lib/prisma')
  const auth = getAuth(req)
  const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
  const url = new URL(req.url)
  const tenantIdParam = url.searchParams.get('tenantId')

  const where: any = {}
  if (isSuperAdmin && tenantIdParam) {
    where.tenantId = tenantIdParam
  } else if (!isSuperAdmin) {
    where.tenantId = auth.tenantId
  }

  const vouchers = await prisma.voucher.findMany({
    where,
  
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formatted = vouchers.map((v) => ({
    id: v.id,
    tenantId: v.tenantId ?? '',
    code: v.code ?? '',
    discountType: v.type === 'PERCENTAGE' ? 'percentage' : 'fixed',
    discountValue: Number(v.value),
    minPurchase: Number(v.minOrder),
    maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : undefined,
    usageLimit: v.maxUses,
    usedCount: v.usedCount,
    usageType: v.usageType,
    validFrom: v.validFrom,
    validUntil: v.validUntil,
    isActive: v.isActive ,
    createdAt: v.createdAt,
  }))

  return Response.json(formatted)
}
// END FUNGSI GET DATA vouchers

// FUNGSI CREATE vouchers
export async function POST(req: Request) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const auth = getAuth(req)
    const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
    const body = await req.json()

    // VALIDASI
    if (!body.discountType || !body.discountValue) {
      return Response.json(
        { message: 'Discount type & value required' },
        { status: 400 }
      )
    }

    if (!body.code) {
      return Response.json(
        { message: 'Voucher code is required' },
        { status: 400 }
      )
    }

    if (body.discountType === 'percentage' && body.discountValue > 100) {
      return Response.json(
        { message: 'Max percentage is 100%' },
        { status: 400 }
      )
    }
    if (!body.validFrom || !body.validUntil) {
      return Response.json(
        { message: 'Valid date required' },
        { status: 400 }
      )
    }
    if (new Date(body.validUntil) <= new Date(body.validFrom)) {
      return Response.json(
        { message: 'Valid until must be greater than valid from' },
        { status: 400 }
      )
    }

    // Check unique code
    const existingCode = await prisma.voucher.findUnique({ where: { code: body.code } })
    if (existingCode) {
      return Response.json(
        { message: 'Voucher code already exists' },
        { status: 400 }
      )
    }

    const targetTenantId = isSuperAdmin && body.tenantId ? body.tenantId : auth.tenantId

    const result = await prisma.voucher.create({
      data: {
        tenantId: targetTenantId,
        code: body.code,

        type: body.discountType === 'percentage' ? 'PERCENTAGE' : 'FIXED',
        value: body.discountValue,

        minOrder: body.minPurchase || 0,
        maxDiscount: body.discountType === 'percentage'  ? body.maxDiscount || null: body.discountValue,

        maxUses: body.usageLimit || null,
        usedCount: 0,

        usageType: body.usageType,

        validFrom: new Date(body.validFrom),
        validUntil: new Date(body.validUntil),

        isActive: body.isActive ?? true,
      },
    })

    return Response.json({
      id: result.id,
      tenantId: result.tenantId,
      code: result.code,

      discountType: result.type === 'PERCENTAGE' ? 'percentage' : 'fixed',
      discountValue: Number(result.value),

      minPurchase: Number(result.minOrder),
      maxDiscount: result.maxDiscount ? Number(result.maxDiscount) : undefined,

      usageLimit: result.maxUses,
      usedCount: result.usedCount,

      usageType: result.usageType,

      validFrom: result.validFrom,
      validUntil: result.validUntil,

      isActive: result.isActive,
      createdAt: result.createdAt,
    })

  } catch (err) {
    console.error(err)

    return Response.json(
      { message: 'Failed to create voucher' },
      { status: 500 }
    )
  }
}
// END FUNGSI CREATE vouchers
