import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth'

// FUNGSI UPDATE OUTLET
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuth(req)
    const body = await req.json()
    const outletId = params.id

    if (!body.name || !body.location) {
      return Response.json(
        { message: 'Name and location required' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // 🔥 update outlet
      const outlet = await tx.outlet.update({
        where: {
          id: outletId,
        },
        data: {
          name: body.name,
          address: body.location,
          mapsUrl: body.mapsUrl,
          phone: '', 
        },
      })

      // 🔥 update config
      const config = await tx.outletConfig.update({
        where: {
          outletId: outlet.id,
        },
        data: {
          paymentMethods: {
            cash: body.features?.cashless ?? true,
            qris: body.features?.qris ?? true,
            voucher: body.features?.voucher ?? true,
          },
        },
      })

      return { outlet, config }
    })

    return Response.json({
      id: result.outlet.id,
      name: result.outlet.name,
      location: result.outlet.address,
      mapsUrl: result.outlet.mapsUrl,
      status: 'offline',
      features: {
        qris: (result.config.paymentMethods as any)?.qris ?? true,
        voucher: (result.config.paymentMethods as any)?.voucher ?? true,
        cashless: (result.config.paymentMethods as any)?.cash ?? true,
      },
      lastHeartbeat: new Date().toISOString(),
      createdAt: result.outlet.createdAt,
    })

  } catch (err) {
    console.error(err)

    return Response.json(
      { message: 'Failed to update outlet' },
      { status: 500 }
    )
  }
}
// END FUNGSI UPDATE OUTLET


// FUNGSI DELETE OUTLET
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuth(req)
    const outletId = params.id

    await prisma.$transaction(async (tx) => {
      // 🔥 delete config dulu (biar aman kalau ada FK)
      await tx.outletConfig.deleteMany({
        where: {
          outletId,
        },
      })

      // 🔥 delete outlet
      await tx.outlet.delete({
        where: {
          id: outletId,
          tenantId: auth.tenantId, // 🔐 security
        },
      })
    })

    return Response.json({ message: 'Outlet deleted successfully' })
  } catch (err) {
    console.error(err)

    return Response.json(
      { message: 'Failed to delete outlet' },
      { status: 500 }
    )
  }
}
// END FUNGSI DELETE OUTLET
