import { BaseService } from './base.service'
import { supabase } from '../lib/supabase'
import {
  transformFleet,
  transformBooking,
  transformProduct,
  transformService,
  transformWorkshop,
  transformKompetisi,
  transformTenant,
  transformMenuItem,
  transformFoodOrder,
  transformProfile
} from '../lib/supabase'

// ==========================================
// SEWA RC SERVICE
// ==========================================
export const sewaService = {
  fleet: new BaseService('fleet', transformFleet),
  bookings: new BaseService('bookings', transformBooking),

  async bookFleet(fleetId, userId, startDate, endDate, notes = '') {
    try {
      // Get fleet price
      const { data: fleet } = await supabase
        .from('fleet')
        .select('price_per_day')
        .eq('id', fleetId)
        .single()
      
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      const totalPrice = fleet.price_per_day * days
      
      // Create booking
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          user_id: userId,
          fleet_id: fleetId,
          start_date: startDate,
          end_date: endDate,
          total_price: totalPrice,
          status: 'pending',
          payment_status: 'unpaid',
          notes: notes
        }])
        .select()
      
      if (error) throw error
      
      // Update fleet availability
      await supabase
        .from('fleet')
        .update({ 
          unit_tersisa: supabase.rpc('decrement', { x: 1 }),
          status: 'disewa'
        })
        .eq('id', fleetId)
      
      return {
        success: true,
        data: transformBooking(data[0])
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getUserBookings(userId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          fleet:fleet_id (name, category, price_per_day, image_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return {
        success: true,
        data: data.map(item => ({
          ...transformBooking(item),
          fleetName: item.fleet?.name,
          fleetCategory: item.fleet?.category,
          fleetImage: item.fleet?.image_url
        }))
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updateBookingStatus(bookingId, status) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: transformBooking(data[0])
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updatePaymentStatus(bookingId, paymentStatus, paymentMethod) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          payment_status: paymentStatus,
          payment_method: paymentMethod
        })
        .eq('id', bookingId)
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: transformBooking(data[0])
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// ==========================================
// STORE SERVICE
// ==========================================
export const storeService = {
  products: new BaseService('products', transformProduct),

  async updateStock(productId, quantity) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ stock: supabase.rpc('decrement', { x: quantity }) })
        .eq('id', productId)
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: transformProduct(data[0])
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getLowStockProducts(threshold = 5) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock', threshold)
        .order('stock', { ascending: true })
      
      if (error) throw error
      
      return {
        success: true,
        data: data.map(item => transformProduct(item))
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// ==========================================
// REPARASI SERVICE
// ==========================================
export const reparasiService = {
  services: new BaseService('reparasi', transformService),

  async createService(userId, serviceData) {
    try {
      const { data, error } = await supabase
        .from('reparasi')
        .insert([{
          user_id: userId,
          service_name: serviceData.serviceName,
          description: serviceData.description,
          price: serviceData.price,
          estimated_days: serviceData.estimatedDays || 1,
          status: 'pending'
        }])
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: transformService(data[0])
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updateServiceStatus(serviceId, status, technicianId = null) {
    try {
      const updates = { status }
      if (technicianId) {
        updates.technician_id = technicianId
      }
      if (status === 'completed') {
        updates.completed_at = new Date()
      }
      
      const { data, error } = await supabase
        .from('reparasi')
        .update(updates)
        .eq('id', serviceId)
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: transformService(data[0])
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getUserServices(userId) {
    try {
      const { data, error } = await supabase
        .from('reparasi')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return {
        success: true,
        data: data.map(item => transformService(item))
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// ==========================================
// WORKSHOP SERVICE
// ==========================================
export const workshopService = {
  classes: new BaseService('workshop', transformWorkshop),

  async registerParticipant(workshopId) {
    try {
      // Get current registered count
      const { data: workshop } = await supabase
        .from('workshop')
        .select('registered, quota')
        .eq('id', workshopId)
        .single()
      
      if (workshop.registered >= workshop.quota) {
        throw new Error('Kuota sudah penuh')
      }
      
      // Increment registered count
      const { data, error } = await supabase
        .from('workshop')
        .update({ registered: workshop.registered + 1 })
        .eq('id', workshopId)
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: transformWorkshop(data[0])
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getAvailableClasses() {
    try {
      const { data, error } = await supabase
        .from('workshop')
        .select('*')
        .eq('is_active', true)
        .where('registered < quota')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      return {
        success: true,
        data: data.map(item => transformWorkshop(item))
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// ==========================================
// KOMPETISI SERVICE
// ==========================================
export const kompetisiService = {
  competitions: new BaseService('kompetisi', transformKompetisi),

  async registerParticipant(kompetisiId, userId) {
    try {
      // Check if already registered
      const { data: existing, error: checkError } = await supabase
        .from('kompetisi_participants')
        .select('*')
        .eq('kompetisi_id', kompetisiId)
        .eq('user_id', userId)
        .single()
      
      if (existing) {
        throw new Error('Anda sudah terdaftar di kompetisi ini')
      }
      
      // Add participant
      const { error } = await supabase
        .from('kompetisi_participants')
        .insert([{
          kompetisi_id: kompetisiId,
          user_id: userId,
          status: 'registered'
        }])
      
      if (error) throw error
      
      // Update registered count
      const { data, error: updateError } = await supabase
        .from('kompetisi')
        .update({ registered: supabase.rpc('increment', { x: 1 }) })
        .eq('id', kompetisiId)
        .select()
      
      if (updateError) throw updateError
      
      return {
        success: true,
        data: transformKompetisi(data[0])
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getParticipants(kompetisiId) {
    try {
      const { data, error } = await supabase
        .from('kompetisi_participants')
        .select(`
          *,
          profile:user_id (
            id,
            name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('kompetisi_id', kompetisiId)
        .order('registered_at', { ascending: true })
      
      if (error) throw error
      
      return { 
        success: true, 
        data: data.map(item => ({
          ...item,
          user: item.profile
        }))
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getUpcomingCompetitions() {
    try {
      const { data, error } = await supabase
        .from('kompetisi')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
      
      if (error) throw error
      
      return {
        success: true,
        data: data.map(item => transformKompetisi(item))
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// ==========================================
// FOOD COURT SERVICE
// ==========================================
export const foodcourtService = {
  tenants: new BaseService('tenants', transformTenant),
  menu: new BaseService('menu_items', transformMenuItem),
  orders: new BaseService('food_orders', transformFoodOrder),

  async createOrder(orderData) {
    try {
      const { data, error } = await supabase
        .from('food_orders')
        .insert([{
          tenant_id: orderData.tenantId,
          user_id: orderData.userId,
          items: orderData.items,
          subtotal: orderData.subtotal,
          tax: orderData.tax || 0,
          total_price: orderData.totalPrice,
          notes: orderData.notes,
          table_number: orderData.tableNumber,
          status: 'pending',
          payment_status: 'unpaid'
        }])
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: transformFoodOrder(data[0])
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const updates = { status }
      if (status === 'completed') {
        updates.completed_at = new Date()
      }
      
      const { data, error } = await supabase
        .from('food_orders')
        .update(updates)
        .eq('id', orderId)
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: transformFoodOrder(data[0])
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getTenantOrders(tenantId) {
    try {
      const { data, error } = await supabase
        .from('food_orders')
        .select(`
          *,
          tenant:tenant_id (name)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return {
        success: true,
        data: data.map(item => ({
          ...transformFoodOrder(item),
          tenantName: item.tenant?.name
        }))
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('food_orders')
        .select(`
          *,
          tenant:tenant_id (name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return {
        success: true,
        data: data.map(item => ({
          ...transformFoodOrder(item),
          tenantName: item.tenant?.name
        }))
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async calculateSettlement(tenantId, startDate, endDate) {
    try {
      const { data: orders, error } = await supabase
        .from('food_orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'completed')
        .eq('payment_status', 'paid')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
      
      if (error) throw error
      
      const { data: tenant } = await supabase
        .from('tenants')
        .select('settlement_percentage')
        .eq('id', tenantId)
        .single()
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0)
      const settlementAmount = (totalRevenue * tenant.settlement_percentage) / 100
      
      return {
        success: true,
        data: {
          totalOrders: orders.length,
          totalRevenue,
          settlementAmount,
          percentage: tenant.settlement_percentage,
          startDate,
          endDate
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// ==========================================
// AUTH SERVICE
// ==========================================
export const authService = {
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, user: null }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      
      return {
        success: true,
        user: {
          ...user,
          ...transformProfile(profile)
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updateProfile(userId, data) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updateRole(userId, role, currentUser) {
    try {
      // Check if current user is admin/owner
      if (!['owner', 'admin'].includes(currentUser?.role)) {
        throw new Error('Unauthorized: Only admin can update roles')
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return {
        success: true,
        data: data.map(item => transformProfile(item))
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getDashboardStats() {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      // Get total fleet
      const { count: totalFleet } = await supabase
        .from('fleet')
        .select('*', { count: 'exact', head: true })
      
      // Get active bookings
      const { count: activeBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      
      // Get today's revenue
      const today = new Date().toISOString().split('T')[0]
      const { data: todayOrders } = await supabase
        .from('bookings')
        .select('total_price')
        .gte('created_at', today)
        .eq('payment_status', 'paid')
      
      const todayRevenue = todayOrders?.reduce((sum, order) => sum + order.total_price, 0) || 0
      
      return {
        success: true,
        data: {
          totalUsers,
          totalFleet,
          activeBookings,
          todayRevenue
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}