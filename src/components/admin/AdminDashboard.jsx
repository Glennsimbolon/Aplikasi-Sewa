import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Truck, ShoppingBag, Wrench, GraduationCap, Trophy, UtensilsCrossed, DollarSign, Users, TrendingUp } from 'lucide-react'
import { C } from '../../utils/constants'
import { rupiah } from '../../utils/helpers'

const AdminDashboard = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'Total Pendapatan Bulan Ini', value: rupiah(152500000), icon: DollarSign, color: C.green },
    { label: 'Unit RC Tersewa', value: '24', icon: Truck, color: C.amber },
    { label: 'Total Customer', value: '156', icon: Users, color: '#FFB020' },
    { label: 'Transaksi Hari Ini', value: '18', icon: TrendingUp, color: C.steel },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="f-display font-bold text-3xl text-paper">Dashboard Admin</h1>
        <p className="text-steel mt-1">Selamat datang, {user?.name}! Berikut ringkasan bisnis hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between">
              <stat.icon size={20} style={{ color: stat.color }} />
              <span className="text-xs text-steel">Updated</span>
            </div>
            <div className="mt-3">
              <div className="f-display font-bold text-2xl text-paper">{stat.value}</div>
              <div className="text-sm text-steel">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <h2 className="f-display font-bold text-2xl text-paper mb-4">Modul Admin</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: Truck, label: 'Sewa RC', path: '/admin/sewa' },
          { icon: ShoppingBag, label: 'Toko RC', path: '/admin/store' },
          { icon: Wrench, label: 'Reparasi', path: '/admin/reparasi' },
          { icon: GraduationCap, label: 'Workshop', path: '/admin/workshop' },
          { icon: Trophy, label: 'Kompetisi', path: '/admin/kompetisi' },
          { icon: UtensilsCrossed, label: 'Food Court', path: '/admin/foodcourt' },
        ].map((mod) => (
          <Link
            key={mod.label}
            to={mod.path}
            className="card p-4 text-center card-hover hover:border-amber"
          >
            <mod.icon size={24} className="mx-auto mb-2" style={{ color: C.amber }} />
            <div className="text-sm font-medium text-paper">{mod.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard