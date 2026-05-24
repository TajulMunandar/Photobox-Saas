import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth'

// FUNGSI GET SINGLE OUTLET (with config + recent heartbeats)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = getAuth(req)
  const outletId = params.id
  // Allow SUPER_ADMIN or unauthenticated dev access (for multi-tenant management UI)
  const isSuperAdmin = !auth.user || auth.user?.role === 'SUPER_ADMIN'

  try {
    const outlet = await prisma.outlet.findFirst({
      where: {
        id: outletId,
        ...(isSuperAdmin ? {} : { tenantId: auth.tenantId }),
      },
      include: {
        config: true,
        heartbeats: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!outlet) {
      return Response.json({ message: 'Outlet not found' }, { status: 404 })
    }

    return Response.json({
      id: outlet.id,
      name: outlet.name,
      location: outlet.address,
      address: outlet.address,
      phone: outlet.phone || '',
      latitude: outlet.latitude?.toString() || '',
      longitude: outlet.longitude?.toString() || '',
      mapsUrl: outlet.mapsUrl || '',
      machineId: outlet.machineId,
      pin: outlet.pin,
      isActive: outlet.isActive,
      operatingHours: outlet.operatingHours,
      status: outlet.heartbeats[0]?.status?.toLowerCase() || 'offline',
      lastHeartbeat: outlet.heartbeats[0]?.lastSeen?.toISOString() || null,
      features: {
        qris: (outlet.config?.paymentMethods as any)?.qris ?? true,
        voucher: (outlet.config?.paymentMethods as any)?.voucher ?? true,
        cashless: (outlet.config?.paymentMethods as any)?.cash ?? true,
      },
      config: outlet.config ? {
        priceDefault: Number(outlet.config.priceDefault),
        printEnabled: outlet.config.printEnabled,
        galleryEnabled: outlet.config.galleryEnabled,
        gifEnabled: outlet.config.gifEnabled,
        newspaperEnabled: outlet.config.newspaperEnabled,
        paymentMethods: outlet.config.paymentMethods,
      } : null,
      recentHeartbeats: outlet.heartbeats.map(h => ({
        id: h.id,
        status: h.status,
        lastSeen: h.lastSeen.toISOString(),
        cpuUsage: h.cpuUsage,
        memoryUsage: h.memoryUsage,
      })),
      createdAt: outlet.createdAt.toISOString(),
    })
  } catch (err) {
    console.error(err)
    return Response.json({ message: 'Failed to fetch outlet' }, { status: 500 })
  }
}

// FUNGSI UPDATE OUTLET
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuth(req)
    const body = await req.json()
    const outletId = params.id
    const isSuperAdmin = !auth.user || auth.user?.role === 'SUPER_ADMIN'

    if (!body.name || !body.location) {
      return Response.json(
        { message: 'Name and location required' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // Security: only super admin or owner of the tenant can update
      const where = isSuperAdmin ? { id: outletId } : { id: outletId, tenantId: auth.tenantId }

      // First verify access
      const existing = await tx.outlet.findFirst({ where })
      if (!existing) {
        throw new Error('Outlet not found or no permission')
      }

      // 🔥 update outlet
      const outlet = await tx.outlet.update({
        where: { id: outletId },
        data: {
          name: body.name,
          address: body.location,
          mapsUrl: body.mapsUrl || `https://maps.google.com/?q=${body.latitude},${body.longitude}`,
          latitude: body.latitude ? parseFloat(body.latitude) : null,
          longitude: body.longitude ? parseFloat(body.longitude) : null,
          phone: '', 
        },
      })

      // 🔥 update config
      const configUpdateData: any = {}

      if (body.config?.paymentMethods) {
        configUpdateData.paymentMethods = body.config.paymentMethods
      } else {
        configUpdateData.paymentMethods = {
          cash: body.features?.cashless ?? true,
          qris: body.features?.qris ?? true,
          voucher: body.features?.voucher ?? true,
        }
      }

      if (body.config) {
        if (body.config.priceDefault !== undefined) {
          configUpdateData.priceDefault = body.config.priceDefault
        }
        if (body.config.printEnabled !== undefined) configUpdateData.printEnabled = body.config.printEnabled
        if (body.config.galleryEnabled !== undefined) configUpdateData.galleryEnabled = body.config.galleryEnabled
        if (body.config.gifEnabled !== undefined) configUpdateData.gifEnabled = body.config.gifEnabled
        if (body.config.newspaperEnabled !== undefined) configUpdateData.newspaperEnabled = body.config.newspaperEnabled
      }

      const config = await tx.outletConfig.update({
        where: {
          outletId: outlet.id,
        },
        data: configUpdateData,
      })

      return { outlet, config }
    })

    return Response.json({
      id: result.outlet.id,
      name: result.outlet.name,
      location: result.outlet.address,
      mapsUrl: result.outlet.mapsUrl,
      latitude: result.outlet.latitude?.toString() ?? '',
      longitude: result.outlet.longitude?.toString() ?? '',
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

// FUNGSI TOGGLE ACTIVE STATUS (for booth login/logout)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const outletId = params.id

    const outlet = await prisma.outlet.update({
      where: { id: outletId },
      data: {
        isActive: body.isActive === true,
      },
    })

    return Response.json({
      id: outlet.id,
      isActive: outlet.isActive,
    })
  } catch (err) {
    console.error(err)
    return Response.json(
      { message: 'Failed to update outlet status' },
      { status: 500 }
    )
  }
}
// END FUNGSI TOGGLE ACTIVE STATUS


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
