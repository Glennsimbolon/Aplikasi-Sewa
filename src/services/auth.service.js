// src/services/auth.service.js
import { supabase } from '../lib/supabase'

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
      
      // Jika profile belum ada, buat otomatis
      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id, 
            email: user.email, 
            name: user.user_metadata?.name || user.email || 'User',
            phone: user.user_metadata?.phone || '',
            role: 'customer' 
          }])
          .select()
          .single()
        
        if (createError) {
          console.error('Create profile error:', createError)
          // Fallback: return user tanpa profile
          return { 
            success: true, 
            user: { 
              ...user, 
              name: user.email || 'User',
              role: 'customer' 
            } 
          }
        }
        
        return {
          success: true,
          user: {
            ...user,
            ...newProfile
          }
        }
      }
      
      if (error) throw error
      
      return {
        success: true,
        user: {
          ...user,
          ...profile
        }
      }
    } catch (error) {
      console.error('Error getting current user:', error)
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

  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}