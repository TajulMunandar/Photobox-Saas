import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const outletId = url.searchParams.get('outletId')

  if (!outletId) {
    return Response.json({ message: 'outletId required' }, { status: 400 })
  }

  try {
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
      select: { tenantId: true },
    })

    if (!outlet) {
      return Response.json([], { status: 200 })
    }

    const templates = await prisma.frameTemplate.findMany({
      where: {
        tenantId: outlet.tenantId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json(templates.map((t: any) => ({
      id: t.id,
      name: t.name,
      imageUrl: t.imageUrl || '',
      isActive: t.isActive,
    })))
  } catch (err) {
    console.error(err)
    return Response.json([], { status: 500 })
  }
}
