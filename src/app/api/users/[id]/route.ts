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
    const userId = params.id

    if (!body.name || !body.email) {
      return Response.json(
        { message: 'Name and Email required' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {

      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          name: body.name,
          outletId: body.outletId || null,
          email: body.email,
          role: body.role.toUpperCase(),
          isActive: body.status === 'active',
        },
        include: {
          outlet: {
            select: {
              name: true,
            },
          },
        },
      })
      return user
    })

      return Response.json({
      id: result.id,
      tenantId: result.tenantId,
      outletId: result.outletId ?? '',
      email: result.email ?? '',
      name: result.name ?? '',
      role: result.role ?? '',

      status: result.isActive ? 'active' : 'inactive',

      outletName: result.outlet?.name ?? '',
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
    const auth = getAuth(req)
    const userId = params.id

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
