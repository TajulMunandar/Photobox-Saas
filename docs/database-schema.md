# SnapNext SaaS - Database Schema Design

## Overview
Multi-tenant architecture supporting multiple Vendors with multiple Outlets each.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TENANT (Vendor/Owner)                          │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - name: VARCHAR(255)                                                   │
│ - email: VARCHAR(255) UNIQUE                                            │
│ - phone: VARCHAR(20)                                                   │
│ - logo_url: TEXT                                                        │
│ - primary_color: VARCHAR(7) (#HEX)                                      │
│ - subscription_plan: ENUM('free', 'starter', 'pro', 'enterprise')       │
│ - is_active: BOOLEAN                                                    │
│ - created_at: TIMESTAMP                                                │
│ - updated_at: TIMESTAMP                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              OUTLET                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - tenant_id: UUID (FK -> tenants.id)                                    │
│ - name: VARCHAR(255)                                                    │
│ - address: TEXT                                                        │
│ - phone: VARCHAR(20)                                                    │
│ - latitude: DECIMAL(10,8)                                              │
│ - longitude: DECIMAL(11,8)                                             │
│ -营业时间: JSON ({"monday": "09:00-21:00", ...})                        │
│ - is_active: BOOLEAN                                                    │
│ - machine_id: VARCHAR(50) (unique booth identifier)                    │
│ - created_at: TIMESTAMP                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           OUTLET_CONFIG                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - outlet_id: UUID (FK -> outlets.id)                                    │
│ - payment_methods: JSON ({"cash": true, "qris": true, "voucher": true})│
│ - price_default: DECIMAL(10,2)                                         │
│ - print_enabled: BOOLEAN                                               │
│ - gallery_enabled: BOOLEAN                                             │
│ - gif_enabled: BOOLEAN                                                 │
│ - newspaper_enabled: BOOLEAN                                           │
│ - created_at: TIMESTAMP                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             USERS                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - tenant_id: UUID (FK -> tenants.id)                                    │
│ - outlet_id: UUID (FK -> outlets.id) NULLABLE                           │
│ - email: VARCHAR(255) UNIQUE                                            │
│ - password_hash: VARCHAR(255)                                          │
│ - name: VARCHAR(255)                                                    │
│ - role: ENUM('super_admin', 'owner', 'manager', 'staff')               │
│ - is_active: BOOLEAN                                                    │
│ - last_login: TIMESTAMP                                                 │
│ - created_at: TIMESTAMP                                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           FRAME_TEMPLATES                               │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - tenant_id: UUID (FK -> tenants.id)                                    │
│ - name: VARCHAR(255)                                                   │
│ - type: ENUM('4r', 'a4_newspaper', 'custom')                           │
│ - image_url: TEXT                                                      │
│ - thumbnail_url: TEXT                                                  │
│ - width: INTEGER                                                        │
│ - height: INTEGER                                                       │
│ - price: DECIMAL(10,2)                                                 │
│ - is_active: BOOLEAN                                                    │
│ - created_at: TIMESTAMP                                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          SESSION_PHOTOS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - outlet_id: UUID (FK -> outlets.id)                                    │
│ - session_code: VARCHAR(20) UNIQUE                                     │
│ - status: ENUM('capturing', 'processing', 'completed', 'failed')       │
│ - frame_id: UUID (FK -> frame_templates.id)                             │
│ - photos: JSON (array of photo URLs)                                   │
│ - gif_url: TEXT NULLABLE                                               │
│ - newspaper_url: TEXT NULLABLE                                         │
│ - total_price: DECIMAL(10,2)                                           │
│ - payment_method: ENUM('cash', 'qris', 'voucher')                      │
│ - payment_status: ENUM('pending', 'paid', 'failed')                    │
│ - payment_ref: VARCHAR(100) NULLABLE                                   │
│ - voucher_code: VARCHAR(50) NULLABLE                                   │
│ - gallery_code: VARCHAR(20) UNIQUE (for QR access)                     │
│ - gallery_expires_at: TIMESTAMP                                         │
│ - created_at: TIMESTAMP                                                 │
│ - completed_at: TIMESTAMP NULLABLE                                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                             VOUCHERS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - tenant_id: UUID (FK -> tenants.id)                                    │
│ - code: VARCHAR(50) UNIQUE                                             │
│ - type: ENUM('percentage', 'fixed')                                    │
│ - value: DECIMAL(10,2)                                                 │
│ - min_order: DECIMAL(10,2)                                            │
│ - max_uses: INTEGER NULLABLE                                           │
│ - used_count: INTEGER DEFAULT 0                                        │
│ - usage_type: ENUM('single_use', 'multi_use')                          │
│ - valid_from: TIMESTAMP                                                │
│ - valid_until: TIMESTAMP                                               │
│ - is_active: BOOLEAN                                                    │
│ - created_at: TIMESTAMP                                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           TRANSACTIONS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - outlet_id: UUID (FK -> outlets.id)                                    │
│ - session_id: UUID (FK -> session_photos.id)                            │
│ - amount: DECIMAL(10,2)                                                │
│ - payment_method: ENUM('cash', 'qris', 'voucher', 'gateway')           │
│ - payment_gateway: ENUM('tokopay', 'midtrans', 'doku') NULLABLE        │
│ - transaction_ref: VARCHAR(100)                                        │
│ - qris_string: TEXT NULLABLE (for dynamic QRIS)                         │
│ - status: ENUM('pending', 'success', 'failed', 'refunded')             │
│ - created_at: TIMESTAMP                                                │
│ - paid_at: TIMESTAMP NULLABLE                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          BOOTH_HEARTBEAT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - machine_id: VARCHAR(50)                                              │
│ - outlet_id: UUID (FK -> outlets.id)                                    │
│ - status: ENUM('online', 'offline', 'error')                           │
│ - cpu_usage: DECIMAL(5,2)                                              │
│ - memory_usage: DECIMAL(5,2)                                           │
│ - disk_usage: DECIMAL(5,2)                                             │
│ - last_photo_time: TIMESTAMP NULLABLE                                  │
│ - last_seen: TIMESTAMP                                                 │
│ - created_at: TIMESTAMP                                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           GALLERY_QUEUE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - session_id: UUID (FK -> session_photos.id)                            │
│ - type: ENUM('photo', 'gif', 'newspaper')                              │
│ - local_path: TEXT                                                     │
│ - cloud_url: TEXT NULLABLE                                             │
│ - status: ENUM('pending', 'uploading', 'completed', 'failed')         │
│ - retry_count: INTEGER DEFAULT 0                                       │
│ - max_retries: INTEGER DEFAULT 3                                       │
│ - error_message: TEXT NULLABLE                                         │
│ - created_at: TIMESTAMP                                                │
│ - updated_at: TIMESTAMP                                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           MARKETING_TESTIMONI                           │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - tenant_id: UUID (FK -> tenants.id)                                    │
│ - outlet_id: UUID (FK -> outlets.id) NULLABLE                           │
│ - customer_name: VARCHAR(255)                                          │
│ - customer_photo: TEXT NULLABLE                                         │
│ - message: TEXT                                                        │
│ - rating: INTEGER (1-5)                                                │
│ - is_approved: BOOLEAN DEFAULT false                                   │
│ - created_at: TIMESTAMP                                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           BRAND_ASSETS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                         │
│ - tenant_id: UUID (FK -> tenants.id)                                    │
│ - type: ENUM('hero_image', 'logo', 'favicon', 'banner')               │
│ - url: TEXT                                                            │
│ - is_active: BOOLEAN DEFAULT true                                      │
│ - created_at: TIMESTAMP                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Row Level Security (RLS) Policies

### Tenants Table
- `tenant_admins` can read/update their own tenant
- Super admin can read all

### Outlets Table
- Tenant admins can CRUD outlets within their tenant
- Public can read outlets (for map locator)

### Sessions/Transactions
- Users can only access data within their tenant
- Booth machines can access via machine_id authentication

## Indexes
- `idx_sessions_outlet_status` on session_photos(outlet_id, status)
- `idx_transactions_outlet` on transactions(outlet_id, created_at)
- `idx_heartbeat_machine` on booth_heartbeat(machine_id, last_seen)
- `idx_vouchers_code` on vouchers(code) where is_active = true