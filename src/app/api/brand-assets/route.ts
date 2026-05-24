import { getAuth } from '@/lib/auth'

export async function GET(req: Request) {
  const { prisma } = await import('@/lib/prisma')
  const auth = getAuth(req)
  const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId')

  try {
    const where: any = {}
    if (isSuperAdmin && tenantId) {
      where.tenantId = tenantId
    } else if (!isSuperAdmin) {
      where.tenantId = auth.tenantId
    }

    const assets = await prisma.brandAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json(assets)
  } catch (error) {
    console.error('Failed to fetch brand assets:', error)
    return Response.json([], { status: 500 })
  }
}

export async function POST(req: Request) {
  const { prisma } = await import('@/lib/prisma')
  const auth = getAuth(req)
  const body = await req.json()

  try {
    const asset = await prisma.brandAsset.create({
      data: {
        tenantId: body.tenantId || auth.tenantId,
        type: body.type,
        url: body.url,
        isActive: body.isActive !== false,
      },
    })

    return Response.json(asset)
  } catch (error) {
    console.error('Failed to create brand asset:', error)
    return Response.json({ message: 'Failed to create brand asset' }, { status: 500 })
  }
}
