import { getAuth, hashPassword } from '@/lib/auth' // nanti bikin


// FUNGSI GET DATA USER
export async function GET(req: Request) {
  const { prisma } = await import('@/lib/prisma')
  const auth = getAuth(req)
  const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'

  const where: any = {}
  if (!isSuperAdmin) {
    where.tenantId = auth.tenantId
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      tenant: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formatted = users.map((u) => ({
    id: u.id,
    tenantId: u.tenantId ?? '',
    tenantName: u.tenant?.name ?? '',
    email: u.email ?? '',
    name: u.name ?? '',
    role: u.role.toLocaleLowerCase() ?? '',
    status: u.isActive === true ? 'active' : 'inactive',
    createdAt: u.createdAt,
  }))

  return Response.json(formatted)
}
// END FUNGSI GET DATA USER

// FUNGSI CREATE USER
export async function POST(req: Request) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const auth = getAuth(req)
    const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
    const body = await req.json()

    if (!body.name || !body.email) {
      return Response.json(
        { message: 'Name and email required' },
        { status: 400 }
      )
    }

    if (!body.password) {
      return Response.json(
        { message: 'Password is required' },
        { status: 400 }
      )
    }

    const tenantId = isSuperAdmin && body.tenantId ? body.tenantId : auth.tenantId
    const passwordHash = await hashPassword(body.password)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId,
          email: body.email,
          passwordHash,
          name: body.name,
          role: body.role.toUpperCase(),
          isActive: body.status === 'active',
          lastLogin: null,
        },
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
      { message: 'Failed to create user' },
      { status: 500 }
    )
  }
}
// END FUNGSI CREATE USER
