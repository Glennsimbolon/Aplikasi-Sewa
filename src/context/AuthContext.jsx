// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ROLES } from '../utils/constants'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ==========================================
  // MANUAL USERS (FALLBACK jika Supabase error)
  // ==========================================
  const MANUAL_USERS = [
    { id: 1, name: 'Admin Gaspol', email: 'admin@gaspol.com', password: 'admin123', role: ROLES.ADMIN },
    { id: 2, name: 'Owner Gaspol', email: 'owner@gaspol.com', password: 'owner123', role: ROLES.OWNER },
    { id: 3, name: 'Customer Gaspol', email: 'customer@gaspol.com', password: 'customer123', role: ROLES.CUSTOMER },
  ]

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Coba ambil profile dari Supabase
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (error) {
            // Jika profile tidak ditemukan, buat baru
            if (error.code === 'PGRST116') {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{ 
                  id: session.user.id, 
                  email: session.user.email, 
                  name: session.user.user_metadata?.name || session.user.email,
                  role: 'customer' 
                }])
                .select()
                .single()
              
              if (!createError && newProfile) {
                setUser({ ...session.user, ...newProfile })
              } else {
                // Jika gagal buat profile, pakai data dari session
                setUser({ 
                  ...session.user, 
                  name: session.user.email,
                  role: 'customer' 
                })
              }
            } else {
              // Error lain, pakai session user saja
              setUser({ 
                ...session.user, 
                name: session.user.email,
                role: 'customer' 
              })
            }
          } else {
            setUser({ ...session.user, ...profile })
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        // Cek localStorage untuk manual user
        const savedUser = localStorage.getItem('gaspol_user')
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser))
          } catch (e) {
            localStorage.removeItem('gaspol_user')
          }
        }
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (error && error.code === 'PGRST116') {
            // Profile belum ada, buat baru
            const { data: newProfile } = await supabase
              .from('profiles')
              .insert([{ 
                id: session.user.id, 
                email: session.user.email, 
                name: session.user.user_metadata?.name || session.user.email,
                role: 'customer' 
              }])
              .select()
              .single()
            
            if (newProfile) {
              setUser({ ...session.user, ...newProfile })
            } else {
              setUser({ ...session.user, name: session.user.email, role: 'customer' })
            }
          } else if (profile) {
            setUser({ ...session.user, ...profile })
          } else {
            setUser({ ...session.user, name: session.user.email, role: 'customer' })
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          localStorage.removeItem('gaspol_user')
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ==========================================
  // LOGIN - Coba Supabase dulu, lalu fallback ke manual
  // ==========================================
  const login = async (email, password) => {
    setLoading(true)
    
    try {
      // Coba login ke Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (!error && data.user) {
        // Ambil profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        const userData = { ...data.user, ...profile }
        setUser(userData)
        localStorage.setItem('gaspol_user', JSON.stringify(userData))
        setLoading(false)
        return { success: true, user: userData }
      }
      
      // Jika Supabase gagal, cek manual users
      const manualUser = MANUAL_USERS.find(
        u => u.email === email && u.password === password
      )
      
      if (manualUser) {
        const userData = {
          id: manualUser.id,
          email: manualUser.email,
          name: manualUser.name,
          role: manualUser.role
        }
        setUser(userData)
        localStorage.setItem('gaspol_user', JSON.stringify(userData))
        setLoading(false)
        return { success: true, user: userData }
      }
      
      setLoading(false)
      return { success: false, error: error?.message || 'Email atau password salah!' }
      
    } catch (error) {
      console.error('Login error:', error)
      
      // Fallback ke manual users
      const manualUser = MANUAL_USERS.find(
        u => u.email === email && u.password === password
      )
      
      if (manualUser) {
        const userData = {
          id: manualUser.id,
          email: manualUser.email,
          name: manualUser.name,
          role: manualUser.role
        }
        setUser(userData)
        localStorage.setItem('gaspol_user', JSON.stringify(userData))
        setLoading(false)
        return { success: true, user: userData }
      }
      
      setLoading(false)
      return { success: false, error: 'Email atau password salah!' }
    }
  }

  // ==========================================
  // REGISTER - Tetap pakai Supabase
  // ==========================================
  const register = async (userData) => {
    setLoading(true)
    
    try {
      const { email, password, name, phone } = userData
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name: name || email,
            phone: phone || '' 
          }
        }
      })
      
      if (error) {
        console.error('SignUp error:', error)
        setLoading(false)
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Insert ke profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{ 
            id: data.user.id, 
            email, 
            name: name || email,
            phone: phone || '',
            role: 'customer' 
          }], { onConflict: 'id' })
        
        if (profileError) {
          console.warn('Profile upsert warning:', profileError)
        }
        
        // Auto login setelah register
        const userDataResult = {
          id: data.user.id,
          email: data.user.email,
          name: name || email,
          role: 'customer'
        }
        setUser(userDataResult)
        localStorage.setItem('gaspol_user', JSON.stringify(userDataResult))
        setLoading(false)
        return { success: true, user: userDataResult }
      }
      
      setLoading(false)
      return { success: false, error: 'Gagal mendaftar' }
      
    } catch (error) {
      console.error('Register error:', error)
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('gaspol_user')
  }

  const hasRole = (role) => {
    if (!user) return false
    if (user.role === ROLES.OWNER) return true
    return user.role === role
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated: !!user,
    isAdmin: user?.role === ROLES.ADMIN || user?.role === ROLES.OWNER,
    isOwner: user?.role === ROLES.OWNER
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}