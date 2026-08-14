import { supabase } from '../lib/supabase'

export class BaseService {
  constructor(tableName, transformFn) {
    this.tableName = tableName
    this.transformFn = transformFn
  }

  async getAll(filters = {}, options = {}) {
    try {
      let query = supabase.from(this.tableName).select('*')
      
      // Filter by deleted_at null (soft delete)
      if (options.includeDeleted !== true) {
        query = query.is('deleted_at', null)
      }
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'string') {
            query = query.ilike(key, `%${value}%`)
          } else {
            query = query.eq(key, value)
          }
        }
      })
      
      // Pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }
      
      // Order by
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending || false })
      } else {
        query = query.order('created_at', { ascending: false })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return {
        success: true,
        data: data.map(item => this.transformFn ? this.transformFn(item) : item)
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()
      
      if (error) throw error
      
      return {
        success: true,
        data: this.transformFn ? this.transformFn(data) : data
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async create(item) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([item])
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: this.transformFn ? this.transformFn(data[0]) : data[0]
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...updates })
        .eq('id', id)
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: this.transformFn ? this.transformFn(data[0]) : data[0]
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Soft delete (set deleted_at)
  async delete(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ deleted_at: new Date() })
        .eq('id', id)
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: this.transformFn ? this.transformFn(data[0]) : data
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Hard delete (permanent)
  async hardDelete(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Restore soft deleted
  async restore(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ deleted_at: null })
        .eq('id', id)
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        data: this.transformFn ? this.transformFn(data[0]) : data
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Realtime subscription
  subscribe(callback, event = '*') {
    const channel = supabase
      .channel(`${this.tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table: this.tableName
        },
        (payload) => {
          if (callback) {
            const transformed = {
              ...payload,
              new: this.transformFn ? this.transformFn(payload.new) : payload.new,
              old: this.transformFn ? this.transformFn(payload.old) : payload.old
            }
            callback(transformed)
          }
        }
      )
      .subscribe()

    return channel
  }
}