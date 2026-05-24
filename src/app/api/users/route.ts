import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth' // nanti bikin


// FUNGSI GET DATA USER
export async function GET(req: Request) {
  const auth = getAuth(req)

  const users = await prisma.user.findMany({
    where: {
      tenantId: auth.tenantId, 
    },
    include: {
      outlet: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formatted = users.map((u) => ({
    id: u.id,
    tenantId: u.tenantId ?? '',
    outletId: u.outletId ?? '',
    email: u.email ?? '',
    name: u.name ?? '',
    role: u.role.toLocaleLowerCase() ?? '',
    status: u.isActive === true ? 'active' : 'inactive',
    outletName: u.outlet?.name ?? '',
    createdAt: u.createdAt,
  }))

  return Response.json(formatted)
}
// END FUNGSI GET DATA USER

// FUNGSI CREATE USER
export async function POST(req: Request) {
  try {
    const auth = getAuth(req)
    const body = await req.json()
    if (!body.name || !body.email) {
      return Response.json(
        { message: 'Name and email required' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId: auth.tenantId,
          outletId: body.outletId || null,
          // outletId: body.outletId && body.outletId !== '' ? body.outletId : null,
          email: body.email,
          passwordHash: '',
          name: body.name,
          role: body.role.toUpperCase(),
          isActive: body.status === 'active',
          lastLogin: null,
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
      { message: 'Failed to create user' },
      { status: 500 }
    )
  }
}
// END FUNGSI CREATE USER
