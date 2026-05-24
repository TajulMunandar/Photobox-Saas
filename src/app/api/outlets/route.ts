import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth' // nanti bikin


// FUNGSI GET DATA OUTLET
export async function GET(req: Request) {
  const auth = getAuth(req)

  const outlets = await prisma.outlet.findMany({
    where: {
      tenantId: auth.tenantId, 
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
    const body = await req.json()

    if (!body.name || !body.location) {
      return Response.json(
        { message: 'Name and location required' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const parts = body.location.split(',')
      const city = parts[1]?.trim().toUpperCase().replace(/\s+/g, '-') || 'UNKNOWN'

      const count = await tx.outlet.count({
        where: {
          tenantId: auth.tenantId,
        },
      })

      const number = String(count + 1).padStart(3, '0')

      const machineId = `BOOTH-${city}-${number}`

      const outlet = await tx.outlet.create({
        data: {
          tenantId: auth.tenantId,
          name: body.name,
          address: body.location,
          phone: ``,
          latitude: null,
          longitude: null,
          mapsUrl: body.mapsUrl,
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
    return Response.json(
      { message: 'Failed to create outlet' },
      { status: 500 }
    )
  }
}
// END FUNGSI CREATE OUTLET
