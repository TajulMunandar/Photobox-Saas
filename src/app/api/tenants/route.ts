import { getAuth } from '@/lib/auth'

export async function GET(req: Request) {
  const { prisma } = await import('@/lib/prisma')
  const auth = getAuth(req)
  const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'

  try {
    const where: any = {}
    if (!isSuperAdmin) {
      where.id = auth.tenantId
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        outlets: {
          include: {
            config: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formatted = tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      phone: tenant.phone || '',
      logoUrl: tenant.logoUrl || '',
      primaryColor: tenant.primaryColor,
      subscriptionPlan: tenant.subscriptionPlan,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt.toISOString(),
      outlets: tenant.outlets.map((o) => ({
        id: o.id,
        name: o.name,
        address: o.address,
        phone: o.phone || '',
        mapsUrl: o.mapsUrl || '',
        machineId: o.machineId,
        pin: o.pin,
        isActive: o.isActive,
        status: 'online', // TODO: compute from latest heartbeat if needed
        features: {
          qris: (o.config?.paymentMethods as any)?.qris ?? true,
          voucher: (o.config?.paymentMethods as any)?.voucher ?? true,
          cashless: (o.config?.paymentMethods as any)?.cash ?? true,
        },
        createdAt: o.createdAt.toISOString(),
      })),
      outletCount: tenant.outlets.length,
    }))

    return Response.json(formatted)
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
    return Response.json([], { status: 500 })
  }
}

export async function POST(req: Request) {
  const { prisma } = await import('@/lib/prisma')
  const auth = getAuth(req)
  const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
  const body = await req.json()

  if (!isSuperAdmin) {
    return Response.json(
      { message: 'Only SUPER_ADMIN can create tenants' },
      { status: 403 }
    )
  }

  try {
    if (!body.name) {
      return Response.json({ message: 'Name is required' }, { status: 400 })
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        logoUrl: body.logoUrl || null,
        primaryColor: body.primaryColor || '#a855f7',
        subscriptionPlan: body.subscriptionPlan || 'FREE',
        isActive: body.isActive !== false,
      },
    })

    return Response.json({
      id: tenant.id,
      name: tenant.name,
      phone: tenant.phone || '',
      logoUrl: tenant.logoUrl || '',
      primaryColor: tenant.primaryColor,
      subscriptionPlan: tenant.subscriptionPlan,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt.toISOString(),
      outlets: [],
      outletCount: 0,
    })
  } catch (error: any) {
    console.error('Failed to create tenant:', error)
    return Response.json({ message: 'Failed to create tenant' }, { status: 500 })
  }
}
