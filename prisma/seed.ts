// ============================================
// Prisma Seed - Dummy Data for Local Demo
// ============================================

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ============================================
  // 0. Hapus semua data lama (urutan aman dari FK)
  // ============================================
  console.log('🗑️  Menghapus data lama...')
  await prisma.apiKey.deleteMany()
  await prisma.brandAsset.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.voucher.deleteMany()
  await prisma.frameTemplate.deleteMany()
  await prisma.sessionPhoto.deleteMany()
  await prisma.outletConfig.deleteMany()
  await prisma.outlet.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()
  console.log('✅ Data lama dihapus')

  // ============================================
  // 1. Create Tenant (Vendor/Owner)
  // ============================================
  const tenant = await prisma.tenant.create({
    data: {
      name: 'SnapNext Demo',
      phone: '+6281234567890',
      logoUrl: '/logo.png',
      primaryColor: '#9333ea',
      subscriptionPlan: 'PRO',
      isActive: true,
    },
  })
  console.log('✅ Created Tenant:', tenant.name)

  // ============================================
  // 2. Create User (Admin)
  // ============================================
  const passwordHash = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@snapnext.id',
      passwordHash,
      name: 'Admin SnapNext',
      role: 'OWNER',
      isActive: true,
    },
  })
  console.log('✅ Created Admin User:', adminUser.email)

  // ============================================
  // 3. Create Outlets (Aceh Utara & Lhokseumawe)
  // ============================================
  const outlet1 = await prisma.outlet.create({
    data: {
      tenantId: tenant.id,
      name: 'SnapNext Aceh Utara',
      address: 'Jl. Tengku Amir Hamzah, Banda Aceh, Aceh',
      phone: '+6281234567891',
      latitude: 5.5577,
      longitude: 95.3193,
      operatingHours: {
        monday: '09:00-21:00',
        tuesday: '09:00-21:00',
        wednesday: '09:00-21:00',
        thursday: '09:00-21:00',
        friday: '09:00-22:00',
        saturday: '09:00-22:00',
        sunday: '10:00-20:00',
      },
      isActive: true,
      machineId: 'BOOTH-ACEH-001',
      pin: '123456',
    },
  })

  const outlet2 = await prisma.outlet.create({
    data: {
      tenantId: tenant.id,
      name: 'SnapNext Lhokseumawe',
      address: 'Jl. Merdeka, Lhokseumawe, Aceh',
      phone: '+6281234567892',
      latitude: 5.1897,
      longitude: 97.1351,
      operatingHours: {
        monday: '08:00-22:00',
        tuesday: '08:00-22:00',
        wednesday: '08:00-22:00',
        thursday: '08:00-22:00',
        friday: '08:00-23:00',
        saturday: '08:00-23:00',
        sunday: '09:00-21:00',
      },
      isActive: true,
      machineId: 'BOOTH-LHOKSEUMAWE-001',
      pin: '789012',
    },
  })
  console.log('✅ Created Outlets:', outlet1.name, outlet2.name)

  // ============================================
  // 4. Create Outlet Configs
  // ============================================
  await prisma.outletConfig.create({
    data: {
      outletId: outlet1.id,
      paymentMethods: { cash: true, qris: true, voucher: true },
      priceDefault: 25000,
      printEnabled: true,
      galleryEnabled: true,
      gifEnabled: true,
      newspaperEnabled: true,
    },
  })

  await prisma.outletConfig.create({
    data: {
      outletId: outlet2.id,
      paymentMethods: { cash: true, qris: true, voucher: true },
      priceDefault: 25000,
      printEnabled: true,
      galleryEnabled: true,
      gifEnabled: true,
      newspaperEnabled: false,
    },
  })
  console.log('✅ Created Outlet Configs')

  // ============================================
  // 5. Create Frame Templates
  // ============================================

  await prisma.frameTemplate.create({
    data: {
      id: 'frame-a4-newspaper-001',
      tenantId: tenant.id,
      name: 'A4 Newspaper Edition',
      type: 'A4_NEWSPAPER',
      imageUrl: '/frames/newspaper-a4.png',
      thumbnailUrl: '/frames/thumb-newspaper-a4.png',
      width: 2480,
      height: 3508,
      price: 35000,
      isActive: true,
    },
  })

  await prisma.frameTemplate.create({
    data: {
      id: 'frame-4r-classic-001',
      tenantId: tenant.id,
      name: '4R Classic',
      type: 'FOUR_R',
      imageUrl: '/frames/4r-classic.png',
      thumbnailUrl: '/frames/thumb-4r-classic.png',
      width: 1200,
      height: 1800,
      price: 25000,
      isActive: true,
    },
  })

  await prisma.frameTemplate.create({
    data: {
      id: 'frame-gif-animated-001',
      tenantId: tenant.id,
      name: 'GIF Animated Frame',
      type: 'CUSTOM',
      imageUrl: '/frames/gif-animated.png',
      thumbnailUrl: '/frames/thumb-gif-animated.png',
      width: 1080,
      height: 1080,
      price: 30000,
      isActive: true,
    },
  })

  console.log('✅ Created Frame Templates')

  // ============================================
  // 6. Create Vouchers
  // ============================================

  await prisma.voucher.create({
    data: {
      tenantId: tenant.id,
      code: 'WELCOME20',
      type: 'PERCENTAGE',
      value: 20,
      minOrder: 20000,
      maxUses: 100,
      usageType: 'SINGLE_USE',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  })

  await prisma.voucher.create({
    data: {
      tenantId: tenant.id,
      code: 'HARGA25K',
      type: 'FIXED',
      value: 5000,
      minOrder: 25000,
      maxUses: null,
      usageType: 'MULTI_USE',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  })

  await prisma.voucher.create({
    data: {
      tenantId: tenant.id,
      code: 'GRATIS10K',
      type: 'FIXED',
      value: 10000,
      minOrder: 30000,
      maxUses: 50,
      usageType: 'SINGLE_USE',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  })

  console.log('✅ Created Vouchers')

  // ============================================
  // 7. Create Testimonials
  // ============================================

  await prisma.testimonial.create({
    data: {
      tenantId: tenant.id,
      outletId: outlet1.id,
      customerName: 'Ahmad Yusuf',
      customerPhoto: '/testimonials/ahmad.jpg',
      message: 'Sangat enjoy! Foto hasilnya bagus dan prosesnya cepat. recommend banget!',
      rating: 5,
      isApproved: true,
    },
  })

  await prisma.testimonial.create({
    data: {
      tenantId: tenant.id,
      outletId: outlet2.id,
      customerName: 'Siti Aminah',
      message: 'Pertama kali coba photo booth, langsung jadi fans. Frame-nya aesthetic bgtt!',
      rating: 5,
      isApproved: true,
    },
  })

  await prisma.testimonial.create({
    data: {
      tenantId: tenant.id,
      outletId: outlet1.id,
      customerName: 'Budi Santoso',
      message: 'Bagus untuk acara keluarga. Anak-anak suka banget.',
      rating: 4,
      isApproved: true,
    },
  })

  console.log('✅ Created Testimonials')

  // ============================================
  // 8. Create Brand Assets
  // ============================================

  await prisma.brandAsset.create({
    data: {
      tenantId: tenant.id,
      type: 'HERO_IMAGE',
      url: '/brand/hero-default.jpg',
      isActive: true,
    },
  })

  await prisma.brandAsset.create({
    data: {
      tenantId: tenant.id,
      type: 'LOGO',
      url: '/brand/logo.png',
      isActive: true,
    },
  })

  await prisma.brandAsset.create({
    data: {
      tenantId: tenant.id,
      type: 'FAVICON',
      url: '/brand/favicon.ico',
      isActive: true,
    },
  })

  console.log('✅ Created Brand Assets')

  // ============================================
  // 9. Create API Keys for Booth machines
  // ============================================

  await prisma.apiKey.create({
    data: {
      key: 'demo-key-booth-aceh-001',
      outletId: outlet1.id,
      name: 'Aceh Utara Booth',
      permissions: ['capture', 'upload', 'print'],
      isActive: true,
    },
  })

  await prisma.apiKey.create({
    data: {
      key: 'demo-key-booth-lhokseumawe-001',
      outletId: outlet2.id,
      name: 'Lhokseumawe Booth',
      permissions: ['capture', 'upload', 'print'],
      isActive: true,
    },
  })

  console.log('✅ Created API Keys')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Login Credentials:')
  console.log('   Email: admin@snapnext.id')
  console.log('   Password: admin123')
  console.log('\n📍 Outlets:')
  console.log('   - Aceh Utara (BOOTH-ACEH-001)')
  console.log('   - Lhokseumawe (BOOTH-LHOKSEUMAWE-001)')
  console.log('\n🎫 Active Vouchers:')
  console.log('   - WELCOME20 (20% off, single-use)')
  console.log('   - HARGA25K (Rp 5,000 off, multi-use)')
  console.log('   - GRATIS10K (Rp 10,000 off, single-use)')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })