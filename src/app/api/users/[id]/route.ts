import { getAuth } from '@/lib/auth'

// FUNGSI UPDATE USER
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const auth = getAuth(req)
    const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
    const body = await req.json()
    const userId = params.id

    if (!body.name || !body.email) {
      return Response.json(
        { message: 'Name and Email required' },
        { status: 400 }
      )
    }

    // MANAGER cannot edit OWNER users
    const isManager = auth.user?.role === 'MANAGER'
    if (isManager) {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })
      if (targetUser?.role === 'OWNER') {
        return Response.json(
          { message: 'Manager cannot edit owner users' },
          { status: 403 }
        )
      }
    }

    const updateData: any = {
      name: body.name,
      email: body.email,
      role: body.role.toUpperCase(),
      isActive: body.status === 'active',
    }
    if (isSuperAdmin && body.tenantId) {
      updateData.tenantId = body.tenantId
    }

    const result = await prisma.$transaction(async (tx) => {

      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: updateData,
      })
      return user
    })

      return Response.json({
      id: result.id,
      tenantId: result.tenantId,
      email: result.email ?? '',
      name: result.name ?? '',
      role: result.role ?? '',
      status: result.isActive ? 'active' : 'inactive',
      createdAt: result.createdAt,
    })

  } catch (err) {
    console.error(err)

    return Response.json(
      { message: 'Failed to update outlet' },
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
    const { prisma } = await import('@/lib/prisma')
    const auth = getAuth(req)
    const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
    const userId = params.id

    if (!isSuperAdmin) {
      // Only allow deleting users in your own tenant
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, role: true },
      })
      if (!userToDelete || userToDelete.tenantId !== auth.tenantId) {
        return Response.json({ message: 'Forbidden' }, { status: 403 })
      }
      // MANAGER cannot delete OWNER users
      if (auth.user?.role === 'MANAGER' && userToDelete.role === 'OWNER') {
        return Response.json(
          { message: 'Manager cannot delete owner users' },
          { status: 403 }
        )
      }
    }

    await prisma.$transaction(async (tx) => {

      await tx.user.delete({
        where: {
          id: userId
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
// END FUNGSI DELETE USER
