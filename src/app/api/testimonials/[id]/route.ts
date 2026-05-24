import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth'

// FUNGSI UPDATE testimonial

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuth(req)
    const body = await req.json()
    const testimonialId = params.id

    if (
      body.customerName === undefined &&
      body.outletId === undefined &&
      body.comment === undefined &&
      body.rating === undefined &&
      body.isApproved === undefined
    ) {
      return Response.json(
        { message: 'No data to update' },
        { status: 400 }
      )
    }


    if (body.rating !== undefined) {
      if (body.rating < 1 || body.rating > 5) {
        return Response.json(
          { message: 'Rating must be between 1 and 5' },
          { status: 400 }
        )
      }
    }

    if (body.customerName !== undefined && !body.customerName) {
      return Response.json(
        { message: 'Customer name cannot be empty' },
        { status: 400 }
      )
    }

    if (body.comment !== undefined && !body.comment) {
      return Response.json(
        { message: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    const result = await prisma.testimonial.update({
      where: {
        id: testimonialId,
        tenantId: auth.tenantId,
      },
      data: {
        ...(body.customerName !== undefined && {
          customerName: body.customerName,
        }),

        ...(body.outletId !== undefined && {
          outletId: body.outletId,
        }),

        ...(body.comment !== undefined && {
          message: body.comment,
        }),

        ...(body.rating !== undefined && {
          rating: body.rating,
        }),

        ...(body.isApproved !== undefined && {
          isApproved: body.isApproved,
        }),
      },
      include: {
        outlet: {
          select: {
            name: true,
          },
        },
      },
    })

    return Response.json({
      id: result.id,
      tenantId: result.tenantId,
      outletId: result.outletId,

      customerName: result.customerName,
      customerPhoto: result.customerPhoto,

      message: result.message,
      comment: result.message, 

      rating: result.rating,
      isApproved: result.isApproved,

      outletName: result.outlet?.name ?? '',
      createdAt: result.createdAt,
    })

  } catch (err) {
    console.error(err)

    return Response.json(
      { message: 'Failed to update testimonial' },
      { status: 500 }
    )
  }
}
// END FUNGSI UPDATE testimonial


// FUNGSI DELETE USER
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuth(req)
    const testimonialId = params.id

    await prisma.$transaction(async (tx) => {

      await tx.testimonial.delete({
        where: {
        id: testimonialId,
        tenantId: auth.tenantId, 
        },
      })
    })

    return Response.json({ message: 'testimonial deleted successfully' })
  } catch (err) {
    console.error(err)

    return Response.json(
      { message: 'Failed to delete testimonial' },
      { status: 500 }
    )
  }
}
// END FUNGSI DELETE USER
