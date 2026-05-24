import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth'

// FUNGSI UPDATE USER
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuth(req)
    const body = await req.json()
    const voucherId = params.id

    if (!body.discountType || !body.discountValue) {
      return Response.json(
        { message: 'Discount type & value required' },
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


    const result = await prisma.voucher.update({
      where: {
        id: voucherId,
        tenantId: auth.tenantId, // 🔒 biar aman (multi-tenant)
      },
      data: {
        type: body.discountType === 'percentage' ? 'PERCENTAGE' : 'FIXED',
        value: body.discountValue,

        minOrder: body.minPurchase || 0,
        maxDiscount: body.maxDiscount || null,

        maxUses: body.usageLimit || null,

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
      maxDiscount: body.discountType === 'percentage'  ? body.maxDiscount || null: body.discountValue,

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
      { message: 'Failed to update voucher' },
      { status: 500 }
    )
  }
}
// END FUNGSI UPDATE USER


// FUNGSI DELETE USER
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuth(req)
    const voucherId = params.id

    await prisma.$transaction(async (tx) => {

      await tx.voucher.delete({
        where: {
          id: voucherId
        },
      })
    })

    return Response.json({ message: 'Voucher deleted successfully' })
  } catch (err) {
    console.error(err)

    return Response.json(
      { message: 'Failed to delete Voucher' },
      { status: 500 }
    )
  }
}
// END FUNGSI DELETE USER
