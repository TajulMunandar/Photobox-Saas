// ============================================
// Photo Compositing Utility
// Composites captured photos into Ramadan frame template
// ============================================

export interface PhotoSlot {
  x: number
  y: number
  width: number
  height: number
  cornerRadius: number
  photoIndex: number // Which captured photo to use (0, 1, or 2 maps to 2 slots each)
}

export interface CompositingOptions {
  frameImageUrl: string
  slots: PhotoSlot[]
  photos: string[] // Base64 or URL array of captured photos
  outputWidth: number
  outputHeight: number
  filter?: string // CSS filter to apply to photos only (not the frame)
}

// Fixed template dimensions
const TEMPLATE_WIDTH = 1080
const TEMPLATE_HEIGHT = 1920

/**
 * Load an image and return it as an HTMLImageElement
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

/**
 * Draw rounded rectangle path
 */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * Draw photo with cover fit (crop to fill, no stretch)
 */
function drawPhotoCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  slot: PhotoSlot
): void {
  const imgRatio = img.width / img.height
  const slotRatio = slot.width / slot.height

  let drawWidth: number
  let drawHeight: number
  let offsetX: number
  let offsetY: number

  if (imgRatio > slotRatio) {
    // Image is wider - fit by height, crop sides
    drawHeight = slot.height
    drawWidth = img.width * (drawHeight / img.height)
    offsetX = slot.x - (drawWidth - slot.width) / 2
    offsetY = slot.y
  } else {
    // Image is taller - fit by width, crop top/bottom
    drawWidth = slot.width
    drawHeight = img.height * (drawWidth / img.width)
    offsetX = slot.x
    offsetY = slot.y - (drawHeight - slot.height) / 2
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
}

/**
 * Generate slot positions for Ramadan frame template 1080x1920
 * Uses hardcoded absolute coordinates
 */
export function generateRamadanFrameSlots(): PhotoSlot[] {
  const cornerRadius = 30

  return [
    // Row 1
    { x: 0, y: 245, width: 500, height: 420, cornerRadius, photoIndex: 0 },
    { x: 580, y: 245, width: 500, height: 420, cornerRadius, photoIndex: 0 },
    // Row 2
    { x: 0, y: 680, width: 500, height: 420, cornerRadius, photoIndex: 1 },
    { x: 580, y: 670, width: 500, height: 420, cornerRadius, photoIndex: 1 },
    // Row 3
    { x: 0, y: 1120, width: 500, height: 420, cornerRadius, photoIndex: 2 },
    { x: 580, y: 1120, width: 500, height: 420, cornerRadius, photoIndex: 2 }
  ]
}

/**
 * Composite captured photos into frame template
 * Returns a data URL of the final image
 * 
 * Draw order:
 * 1. White background
 * 2. All photos clipped to rounded rectangles
 * 3. Frame template LAST (on top of photos)
 */
export async function compositePhotosToFrame(options: CompositingOptions): Promise<string> {
  const { frameImageUrl, slots, photos, outputWidth, outputHeight, filter } = options
  
  // Create canvas with fixed template size
  const canvas = document.createElement('canvas')
  canvas.width = TEMPLATE_WIDTH
  canvas.height = TEMPLATE_HEIGHT
  const ctx = canvas.getContext('2d')!
  
  // Disable blur/smoothing
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  // STEP 1: White background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT)
  
  // STEP 2: Load frame image first (we need it for dimensions)
  const frameImg = await loadImage(frameImageUrl)
  
  // STEP 3: Load all photos
  const loadedPhotos: (HTMLImageElement | null)[] = []
  for (let i = 0; i < photos.length; i++) {
    if (photos[i]) {
      try {
        loadedPhotos[i] = await loadImage(photos[i])
      } catch (error) {
        console.error(`Failed to load photo ${i}:`, error)
        loadedPhotos[i] = null
      }
    } else {
      loadedPhotos[i] = null
    }
  }
  
  // STEP 4: Draw all photos into slots with rounded clip
  for (const slot of slots) {
    const photo = loadedPhotos[slot.photoIndex]
    if (!photo) continue
    
    // Save context for clipping
    ctx.save()
    
    // Create rounded clip path
    roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, slot.cornerRadius)
    ctx.clip()
    
    // Apply filter to photos only
    if (filter && filter !== 'none') {
      ctx.filter = filter
    }
    
    // Draw photo with cover fit
    drawPhotoCover(ctx, photo, slot)
    
    // Reset filter
    ctx.filter = 'none'
    
    ctx.restore()
  }
  
  // STEP 5: Draw frame template LAST (on top of everything)
  ctx.drawImage(frameImg, 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT)
  
  return canvas.toDataURL('image/jpeg', 0.95)
}

/**
 * Quick compositing with auto-generated slots for Ramadan frame
 */
export async function compositeToRamadanFrame(
  frameImageUrl: string,
  photos: string[],
  outputWidth: number = TEMPLATE_WIDTH,
  outputHeight: number = TEMPLATE_HEIGHT,
  filter?: string
): Promise<string> {
  const slots = generateRamadanFrameSlots()
  
  return compositePhotosToFrame({
    frameImageUrl,
    slots,
    photos,
    outputWidth: TEMPLATE_WIDTH,
    outputHeight: TEMPLATE_HEIGHT,
    filter
  })
}

/**
 * Generate a thumbnail preview of the composite
 */
export async function generateCompositeThumbnail(
  frameImageUrl: string,
  photos: string[],
  maxWidth: number = 400,
  filter?: string
): Promise<string> {
  const aspectRatio = TEMPLATE_WIDTH / TEMPLATE_HEIGHT
  const maxHeight = Math.round(maxWidth / aspectRatio)
  
  const slots = generateRamadanFrameSlots().map(slot => ({
    ...slot,
    x: Math.round((slot.x / TEMPLATE_WIDTH) * maxWidth),
    y: Math.round((slot.y / TEMPLATE_HEIGHT) * maxHeight),
    width: Math.round((slot.width / TEMPLATE_WIDTH) * maxWidth),
    height: Math.round((slot.height / TEMPLATE_HEIGHT) * maxHeight),
    cornerRadius: Math.round((slot.cornerRadius / TEMPLATE_WIDTH) * maxWidth)
  }))
  
  const canvas = document.createElement('canvas')
  canvas.width = maxWidth
  canvas.height = maxHeight
  const ctx = canvas.getContext('2d')!
  
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, maxWidth, maxHeight)
  
  const frameImg = await loadImage(frameImageUrl)
  
  const loadedPhotos: (HTMLImageElement | null)[] = []
  for (let i = 0; i < photos.length; i++) {
    if (photos[i]) {
      try {
        loadedPhotos[i] = await loadImage(photos[i])
      } catch {
        loadedPhotos[i] = null
      }
    } else {
      loadedPhotos[i] = null
    }
  }
  
  for (const slot of slots) {
    const photo = loadedPhotos[slot.photoIndex]
    if (!photo) continue
    
    ctx.save()
    roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, slot.cornerRadius)
    ctx.clip()
    
    if (filter && filter !== 'none') {
      ctx.filter = filter
    }
    
    drawPhotoCover(ctx, photo, slot)
    ctx.filter = 'none'
    ctx.restore()
  }
  
  ctx.drawImage(frameImg, 0, 0, maxWidth, maxHeight)
  
  return canvas.toDataURL('image/jpeg', 0.9)
}