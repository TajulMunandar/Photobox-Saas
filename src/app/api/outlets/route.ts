import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth' // nanti bikin


// FUNGSI GET DATA OUTLET
export async function GET(req: Request) {
  const auth = getAuth(req)
  const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
  const url = new URL(req.url)
  const tenantIdParam = url.searchParams.get('tenantId')
  const machineIdParam = url.searchParams.get('machineId')

  const outlets = await prisma.outlet.findMany({
    where: {
      ...(machineIdParam ? { machineId: machineIdParam } : {}),
      ...(!machineIdParam && isSuperAdmin && tenantIdParam
        ? { tenantId: tenantIdParam }
        : !machineIdParam ? { tenantId: auth.tenantId } : {}),
    },
    include: {
      config: true
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formatted = outlets.map((o) => ({
    id: o.id,
    name: o.name ?? '',
    location: o.address ?? '',
    mapsUrl: o.mapsUrl ?? '',
    latitude: o.latitude?.toString() ?? '',
    longitude: o.longitude?.toString() ?? '',
    machineId: o.machineId ?? '',
    pin: o.pin ?? '',
    isActive: o.isActive,
    status: 'offline',
    features: {
      qris: (o.config?.paymentMethods as any)?.qris ?? true,
      voucher: (o.config?.paymentMethods as any)?.voucher ?? true,
      cashless: (o.config?.paymentMethods as any)?.cash ?? true,
    },
    lastHeartbeat: new Date().toISOString(),
    createdAt: o.createdAt,
  }))

  return Response.json(formatted)
}
// END FUNGSI GET DATA OUTLET

// FUNGSI CREATE OUTLET
export async function POST(req: Request) {
  try {
    const auth = getAuth(req)
    const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
    const body = await req.json()

    if (!body.name || !body.location) {
      return Response.json(
        { message: 'Name and location required' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const city = body.name.trim().toUpperCase().replace(/\s+/g, '-') || 'OUTLET'

      const targetTenantId = isSuperAdmin && body.tenantId ? body.tenantId : auth.tenantId

      const count = await tx.outlet.count({
        where: {
          tenantId: targetTenantId,
        },
      })

      const number = String(count + 1).padStart(3, '0')

      const machineId = `BOOTH-${city}-${number}`
      const pin = body.pin || String(Math.floor(100000 + Math.random() * 900000))

      const outlet = await tx.outlet.create({
        data: {
          tenantId: targetTenantId,
          name: body.name,
          address: body.location,
          phone: ``,
          latitude: body.latitude ? parseFloat(body.latitude) : null,
          longitude: body.longitude ? parseFloat(body.longitude) : null,
          mapsUrl: body.mapsUrl || `https://maps.google.com/?q=${body.latitude},${body.longitude}`,
          operatingHours: {
            monday: '08:00-22:00',
            tuesday: '08:00-22:00',
            wednesday: '08:00-22:00',
            thursday: '08:00-22:00',
            friday: '08:00-23:00',
            saturday: '08:00-23:00',
            sunday: '09:00-21:00',
          },
          isActive: true,
          machineId,
          pin,
        },
      })

      const config = await tx.outletConfig.create({
        data: {
          outletId: outlet.id,
          paymentMethods: {
            cash: body.features?.cashless ?? true,
            qris: body.features?.qris ?? true,
            voucher: body.features?.voucher ?? true,
          },
          priceDefault: 30000,
          printEnabled: true,
          galleryEnabled: true,
          gifEnabled: true,
          newspaperEnabled: false,
        },
      })

      return { outlet, config }
    })

    
    return Response.json({
      id: result.outlet.id,
      name: result.outlet.name ?? '',
      location: result.outlet.address ?? '',
      mapsUrl: result.outlet.mapsUrl ?? '',
      latitude: result.outlet.latitude?.toString() ?? '',
      longitude: result.outlet.longitude?.toString() ?? '',
      machineId: result.outlet.machineId,
      pin: result.outlet.pin,
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
    console.error('Failed to create outlet:', err)
    return Response.json(
      { message: 'Failed to create outlet', error: String(err) },
      { status: 500 }
    )
  }
}
// END FUNGSI CREATE OUTLET
