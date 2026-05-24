import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = getAuth(req)
  const body = await req.json()
  const templateId = params.id

  try {
    const template = await prisma.frameTemplate.update({
      where: { id: templateId },
      data: {
        name: body.name,
        type: body.type,
        imageUrl: body.imageUrl,
        thumbnailUrl: body.thumbnailUrl,
        price: body.price,
        isActive: body.isActive,
      },
    })

    return Response.json(template)
  } catch (error) {
    console.error('Failed to update template:', error)
    return Response.json({ message: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const templateId = params.id

  try {
    await prisma.frameTemplate.delete({
      where: { id: templateId },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to delete template:', error)
    return Response.json({ message: 'Failed to delete template' }, { status: 500 })
  }
}
