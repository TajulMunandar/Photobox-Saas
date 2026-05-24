import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/auth'

export async function GET(req: Request) {
  const auth = getAuth(req)
  const isSuperAdmin = auth.user?.role === 'SUPER_ADMIN'
  const url = new URL(req.url)
  const tenantIdParam = url.searchParams.get('tenantId')

  const where: any = {}
  if (isSuperAdmin && tenantIdParam) {
    where.tenantId = tenantIdParam
  } else if (!isSuperAdmin) {
    where.tenantId = auth.tenantId
  }

  const outlets = await prisma.outlet.findMany({
    where,
    include: {
      heartbeats: {
        orderBy: { lastSeen: 'desc' },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 5,
  })

  const formatted = outlets.map((o) => {
    const latest = o.heartbeats[0]
    const status = !latest
      ? 'offline'
      : latest.status === 'ONLINE'
        ? 'online'
        : 'error'

    const lastSeen = latest?.lastSeen || o.updatedAt
    const lastPhotoTime = latest?.lastPhotoTime || null

    return {
      id: o.machineId || o.id,
      name: `Booth ${o.machineId || 'Unknown'}`,
      outletId: o.id,
      status,
      lastPhoto: lastPhotoTime
        ? formatRelativeTime(lastPhotoTime)
        : formatRelativeTime(lastSeen),
    }
  })

  return Response.json(formatted)
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}
