import { getAuth } from '@/lib/auth'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { prisma } = await import('@/lib/prisma')
  const body = await req.json()
  const assetId = params.id

  try {
    const asset = await prisma.brandAsset.update({
      where: { id: assetId },
      data: {
        url: body.url,
        isActive: body.isActive,
      },
    })

    return Response.json(asset)
  } catch (error) {
    console.error('Failed to update brand asset:', error)
    return Response.json({ message: 'Failed to update brand asset' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { prisma } = await import('@/lib/prisma')
  const assetId = params.id

  try {
    await prisma.brandAsset.delete({
      where: { id: assetId },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to delete brand asset:', error)
    return Response.json({ message: 'Failed to delete brand asset' }, { status: 500 })
  }
}
