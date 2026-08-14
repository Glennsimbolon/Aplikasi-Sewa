// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// ==========================================
// VITE menggunakan import.meta.env
// ==========================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables')
  console.warn('VITE_SUPABASE_URL:', supabaseUrl || '❌ Missing')
  console.warn('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project-url.supabase.co',
  supabaseAnonKey || 'your-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// ==========================================
// TRANSFORM FUNCTIONS
// ==========================================

export const transformFleet = (data) => ({
  id: data.id,
  name: data.name,
  cat: data.category,
  scale: data.scale,
  speed: data.speed,
  price: data.price_per_day,
  status: data.status,
  rating: data.rating || 0,
  unitTersisa: data.unit_tersisa || 0,
  imageUrl: data.image_url,
  description: data.description,
})

export const transformBooking = (data) => ({
  id: data.id,
  bookingCode: data.booking_code,
  userId: data.user_id,
  fleetId: data.fleet_id,
  fleetName: data.fleet?.name,
  startDate: data.start_date,
  endDate: data.end_date,
  totalPrice: data.total_price,
  status: data.status,
  paymentStatus: data.payment_status,
  notes: data.notes,
  createdAt: data.created_at,
})

export const transformProduct = (data) => ({
  id: data.id,
  name: data.name,
  category: data.category,
  price: data.price,
  stock: data.stock,
  description: data.description,
  imageUrl: data.image_url,
})

export const transformService = (data) => ({
  id: data.id,
  serviceCode: data.service_code,
  userId: data.user_id,
  serviceName: data.service_name,
  description: data.description,
  price: data.price,
  status: data.status,
  estimatedDays: data.estimated_days,
  createdAt: data.created_at,
})

export const transformWorkshop = (data) => ({
  id: data.id,
  name: data.name,
  level: data.level === 'beginner' ? 'Pemula' : 
          data.level === 'intermediate' ? 'Menengah' : 'Lanjutan',
  jadwal: data.schedule,
  kuota: data.quota,
  terisi: data.registered || 0,
  harga: data.price,
  instructor: data.instructor,
  location: data.location,
})

export const transformKompetisi = (data) => ({
  id: data.id,
  name: data.name,
  tanggal: new Date(data.date).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }),
  kuota: data.quota,
  terisi: data.registered || 0,
  hadiah: data.prize || 'Rp 0',
  biaya: data.fee,
  status: data.status,
  location: data.location,
})

export const transformTenant = (data) => ({
  id: data.id,
  userId: data.user_id,
  name: data.name,
  settlementPercentage: data.settlement_percentage || 85,
  contactPerson: data.contact_person,
  phone: data.phone,
  email: data.email,
})

export const transformMenuItem = (data) => ({
  id: data.id,
  name: data.name,
  price: data.price,
  cat: data.category,
  description: data.description,
  imageUrl: data.image_url,
})

export const transformFoodOrder = (data) => ({
  id: data.id,
  orderCode: data.order_code,
  tenantId: data.tenant_id,
  tenantName: data.tenant?.name,
  userId: data.user_id,
  items: data.items,
  subtotal: data.subtotal,
  tax: data.tax,
  totalPrice: data.total_price,
  status: data.status,
  paymentStatus: data.payment_status,
  notes: data.notes,
  tableNumber: data.table_number,
  createdAt: data.created_at,
})

export const transformProfile = (data) => ({
  id: data.id,
  name: data.name,
  email: data.email,
  phone: data.phone,
  role: data.role,
  avatarUrl: data.avatar_url,
  isActive: data.is_active,
  lastLogin: data.last_login,
  createdAt: data.created_at,
})