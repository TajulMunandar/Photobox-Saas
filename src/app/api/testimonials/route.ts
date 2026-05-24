import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth' // nanti bikin


// FUNGSI GET DATA Testimonial
export async function GET(req: Request) {
  const auth = getAuth(req)

  const testimonials = await prisma.testimonial.findMany({
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

  const formatted = testimonials.map((t) => ({
    id: t.id,
    tenantId: t.tenantId ?? '',
    outletId: t.outletId ?? '',
    customerName: t.customerName ?? '',
    customerPhoto: t.customerPhoto ?? '',
    comment: t.message ?? '',
    rating: t.rating ?? '',
    isApproved: t.isApproved ?? '',
    createdAt: t.createdAt,
    outletName: t.outlet?.name ?? '',

  }))

  return Response.json(formatted)
}
// END FUNGSI GET DATA Testimonial

// FUNGSI CREATE Testimonial
export async function POST(req: Request) {
  try {
    const auth = getAuth(req)
    const body = await req.json()

    if (!body.customerName) {
      return Response.json(
        { message: 'Customer name is required' },
        { status: 400 }
      )
    }

    if (!body.outletId) {
      return Response.json(
        { message: 'Outlet is required' },
        { status: 400 }
      )
    }

    if (!body.comment) {
      return Response.json(
        { message: 'Message is required' },
        { status: 400 }
      )
    }

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return Response.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const result = await prisma.testimonial.create({
      data: {
        tenantId: auth.tenantId,
        outletId: body.outletId,

        customerName: body.customerName,
        customerPhoto: null,

        message: body.comment, 

        rating: body.rating,
        isApproved: body.isApproved ?? false,
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
      rating: result.rating,
      isApproved: result.isApproved,

      outletName: result.outlet?.name ?? '',

      createdAt: result.createdAt,
    })

  } catch (err) {
    console.error(err)

    return Response.json(
      { message: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
}
// END FUNGSI CREATE Testimonial
