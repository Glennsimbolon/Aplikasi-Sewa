import React, { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Truck, ShoppingBag, Wrench,
  GraduationCap, Trophy, UtensilsCrossed, Users,
  LogOut, Menu, X, Flag
} from 'lucide-react'
import { C } from '../../utils/constants'

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/sewa', label: 'Sewa RC', icon: Truck },
    { path: '/admin/store', label: 'Toko RC', icon: ShoppingBag },
    { path: '/admin/reparasi', label: 'Reparasi', icon: Wrench },
    { path: '/admin/workshop', label: 'Workshop', icon: GraduationCap },
    { path: '/admin/kompetisi', label: 'Kompetisi', icon: Trophy },
    { path: '/admin/foodcourt', label: 'Food Court', icon: UtensilsCrossed },
    { path: '/admin/users', label: 'User Management', icon: Users },
  ]

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-asphalt">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b" style={{ borderColor: C.line, background: C.panel }}>
        <div className="flex items-center gap-2">
          <Flag size={24} color={C.amber} />
          <span className="f-display font-bold text-xl">
            GASPOL<span className="text-amber">RC</span>
          </span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} className="text-paper" /> : <Menu size={24} className="text-paper" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`
            fixed lg:sticky top-0 h-screen w-64 border-r flex-shrink-0 transition-transform duration-300 z-50
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ background: C.panel, borderColor: C.line }}
        >
          <div className="p-4 border-b hidden lg:block" style={{ borderColor: C.line }}>
            <div className="flex items-center gap-2">
              <Flag size={24} color={C.amber} />
              <span className="f-display font-bold text-xl">
                GASPOL<span className="text-amber">RC</span>
              </span>
            </div>
          </div>

          <div className="p-4 border-b" style={{ borderColor: C.line }}>
            <div className="text-sm font-medium text-paper">{user?.name}</div>
            <div className="text-xs text-steel">{user?.role}</div>
          </div>

          <nav className="p-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm
                  ${isActive(item.path) ? 'bg-amber/10 text-amber border border-amber' : 'text-steel hover:bg-panel/50'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: C.line }}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-red hover:bg-red/10 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout