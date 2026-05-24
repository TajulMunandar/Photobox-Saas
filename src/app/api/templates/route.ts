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

    const templates = await prisma.frameTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json(templates)
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return Response.json([], { status: 500 })
  }
}

export async function POST(req: Request) {
  const { prisma } = await import('@/lib/prisma')
  const auth = getAuth(req)
  const body = await req.json()

  try {
    const template = await prisma.frameTemplate.create({
      data: {
        tenantId: body.tenantId || auth.tenantId,
        name: body.name,
        type: body.type || 'FOUR_R',
        imageUrl: body.imageUrl,
        thumbnailUrl: body.thumbnailUrl || body.imageUrl,
        width: body.width || 1080,
        height: body.height || 1920,
        price: body.price || 30000,
        isActive: body.isActive !== false,
      },
    })

    return Response.json(template)
  } catch (error) {
    console.error('Failed to create template:', error)
    return Response.json({ message: 'Failed to create template' }, { status: 500 })
  }
}
