import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Flag, User, Mail, Lock, Phone, AlertCircle } from 'lucide-react'
import { C } from '../../utils/constants'
import toast from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak sama')
      return
    }

    setLoading(true)
    setError('')

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone
    })

    if (result.success) {
      toast.success('Pendaftaran berhasil! Silakan login.')
      navigate('/login')
    } else {
      setError(result.error)
      toast.error(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-asphalt p-4">
      <div className="w-full max-w-md card p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-lg bg-amber flex items-center justify-center">
              <Flag size={32} className="text-asphalt" />
            </div>
          </div>
          <h1 className="f-display font-bold text-3xl">Daftar Akun</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red/10 text-red text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-steel-light mb-2">Nama Lengkap</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-primary pl-10"
                placeholder="Nama lengkap"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-steel-light mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-primary pl-10"
                placeholder="email@contoh.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-steel-light mb-2">Nomor HP</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-primary pl-10"
                placeholder="08123456789"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-steel-light mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-primary pl-10"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-steel-light mb-2">Konfirmasi Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-primary pl-10"
                placeholder="Ulangi password"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Loading...' : 'Daftar'}
          </button>

          <div className="text-center text-sm text-steel">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-amber hover:underline font-medium">
              Masuk sekarang
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register