import { getAuth } from '@/lib/auth'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const auth = getAuth(req)
    const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
    const tenantId = params.id
    const body = await req.json()

    if (!isSuperAdmin && tenantId !== auth.tenantId) {
      return Response.json(
        { message: 'Forbidden' },
        { status: 403 }
      )
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
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
    })
  } catch (error: any) {
    console.error('Failed to update tenant:', error)
    return Response.json({ message: 'Failed to update tenant' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const auth = getAuth(req)
    const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
    const tenantId = params.id

    if (!isSuperAdmin && tenantId !== auth.tenantId) {
      return Response.json(
        { message: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.tenant.delete({
      where: { id: tenantId },
    })

    return Response.json({ message: 'Tenant deleted successfully' })
  } catch (error) {
    console.error('Failed to delete tenant:', error)
    return Response.json(
      { message: 'Failed to delete tenant' },
      { status: 500 }
    )
  }
}
