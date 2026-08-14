import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Flag, Mail, Lock, AlertCircle } from 'lucide-react'
import { C } from '../../utils/constants'
import toast from 'react-hot-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)

    if (result.success) {
      toast.success('Selamat datang kembali!')
      const role = result.user?.role
      if (['owner', 'admin'].includes(role)) {
        navigate('/admin')
      } else if (role === 'kasir') {
        navigate('/kasir')
      } else {
        navigate('/dashboard')
      }
    } else {
      setError(result.error)
      toast.error(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-asphalt p-4">
      <div className="w-full max-w-md card p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-lg bg-amber flex items-center justify-center">
              <Flag size={32} className="text-asphalt" />
            </div>
          </div>
          <h1 className="f-display font-bold text-3xl">
            GASPOL<span className="text-amber">RC</span>
          </h1>
          <p className="text-steel mt-2">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red/10 text-red text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-steel-light mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-primary pl-10"
                placeholder="email@contoh.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-primary pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Loading...' : 'Masuk'}
          </button>

          <div className="text-center text-sm text-steel">
            Belum punya akun?{' '}
            <Link to="/register" className="text-amber hover:underline font-medium">
              Daftar sekarang
            </Link>
          </div>

          <div className="text-xs text-center text-steel/60 border-t border-line pt-4">
            <p>Demo: admin@gaspol.com / admin123</p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login