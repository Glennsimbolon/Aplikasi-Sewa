// src/components/customer/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { C } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { 
  Flag, LogOut, User, Calendar, ShoppingBag, Star, 
  Home, Truck, Wrench, GraduationCap, Trophy, 
  UtensilsCrossed, Clock, CheckCircle, XCircle,
  Menu, X, Loader2
} from 'lucide-react';
import { formatDate, rupiah } from '../../utils/helpers';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalSpent: 0,
    points: 0
  });
  const [menuOpen, setMenuOpen] = useState(false);

  // ==========================================
  // LOAD DATA DARI SUPABASE
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        console.log('🔍 No user found, skipping data load');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Loading data for user:', user.id, user.email);
      setLoading(true);
      
      try {
        let allTrans = [];
        let totalSpent = 0;
        
        // ==========================================
        // 1. AMBIL BOOKINGS (SEWA RC)
        // ==========================================
        console.log('📊 Fetching bookings...');
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            fleet:fleet_id (
              name,
              category,
              price_per_day,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (bookingsError) {
          console.error('❌ Bookings error:', bookingsError);
        } else {
          console.log('✅ Bookings found:', bookingsData?.length || 0);
        }

        // ==========================================
        // 2. AMBIL FOOD ORDERS
        // ==========================================
        console.log('🍔 Fetching food orders...');
        const { data: foodOrdersData, error: foodError } = await supabase
          .from('food_orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (foodError) {
          console.error('❌ Food orders error:', foodError);
        } else {
          console.log('✅ Food orders found:', foodOrdersData?.length || 0);
        }

        // ==========================================
        // 3. AMBIL KOMPETISI PARTICIPANTS
        // ==========================================
        console.log('🏆 Fetching kompetisi...');
        const { data: kompetisiData, error: kompetisiError } = await supabase
          .from('kompetisi_participants')
          .select(`
            *,
            kompetisi:kompetisi_id (
              name,
              date,
              fee
            )
          `)
          .eq('user_id', user.id)
          .order('registered_at', { ascending: false });

        if (kompetisiError) {
          console.error('❌ Kompetisi error:', kompetisiError);
        } else {
          console.log('✅ Kompetisi found:', kompetisiData?.length || 0);
        }

        // ==========================================
        // 4. AMBIL WORKSHOP REGISTRATIONS
        // ==========================================
        console.log('📚 Fetching workshop...');
        const { data: workshopData, error: workshopError } = await supabase
          .from('workshop_registrations')
          .select(`
            *,
            workshop:workshop_id (
              name,
              price
            )
          `)
          .eq('user_id', user.id)
          .order('registered_at', { ascending: false });

        if (workshopError) {
          console.log('ℹ️ Workshop registrations table may not exist yet');
        } else {
          console.log('✅ Workshop found:', workshopData?.length || 0);
        }

        // ==========================================
        // 5. FORMAT BOOKINGS
        // ==========================================
        if (bookingsData && bookingsData.length > 0) {
          const formattedBookings = bookingsData.map(item => ({
            id: `booking-${item.id}`,
            name: item.fleet?.name || 'Unit RC',
            date: item.start_date,
            price: item.total_price,
            status: item.status,
            type: 'Sewa RC',
            category: item.fleet?.category,
            duration: Math.ceil((new Date(item.end_date) - new Date(item.start_date)) / (1000 * 60 * 60 * 24)),
            created_at: item.created_at,
            original: item
          }));
          allTrans = [...allTrans, ...formattedBookings];
          
          const validBookings = bookingsData.filter(b => 
            ['active', 'confirmed', 'completed'].includes(b.status)
          );
          totalSpent += validBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        }

        // ==========================================
        // 6. FORMAT FOOD ORDERS
        // ==========================================
        if (foodOrdersData && foodOrdersData.length > 0) {
          const formattedFood = foodOrdersData.map(item => {
            let displayStatus = item.status;
            if (item.status === 'pending') displayStatus = 'pending';
            else if (item.status === 'preparing') displayStatus = 'active';
            else if (item.status === 'ready') displayStatus = 'active';
            else if (item.status === 'completed') displayStatus = 'completed';
            else if (item.status === 'cancelled') displayStatus = 'cancelled';
            
            return {
              id: `food-${item.id}`,
              name: '🍔 Pesanan Makanan',
              date: item.created_at,
              price: item.total_price,
              status: displayStatus,
              type: 'Food Court',
              items: item.items,
              created_at: item.created_at,
              original: item
            };
          });
          allTrans = [...allTrans, ...formattedFood];
          
          const validFood = foodOrdersData.filter(f => 
            f.status === 'completed' || f.payment_status === 'paid'
          );
          totalSpent += validFood.reduce((sum, f) => sum + (f.total_price || 0), 0);
        }

        // ==========================================
        // 7. FORMAT KOMPETISI
        // ==========================================
        if (kompetisiData && kompetisiData.length > 0) {
          const formattedKompetisi = kompetisiData.map(item => ({
            id: `kompetisi-${item.id}`,
            name: '🏆 ' + (item.kompetisi?.name || 'Kompetisi'),
            date: item.kompetisi?.date || item.registered_at,
            price: item.kompetisi?.fee || 0,
            status: item.status === 'registered' ? 'active' : 
                    item.status === 'confirmed' ? 'confirmed' : 'completed',
            type: 'Kompetisi',
            created_at: item.registered_at,
            original: item
          }));
          allTrans = [...allTrans, ...formattedKompetisi];
          
          const validKompetisi = kompetisiData.filter(k => 
            k.status === 'registered' || k.status === 'confirmed'
          );
          totalSpent += validKompetisi.reduce((sum, k) => sum + (k.kompetisi?.fee || 0), 0);
        }

        // ==========================================
        // 8. FORMAT WORKSHOP
        // ==========================================
        if (workshopData && workshopData.length > 0) {
          const formattedWorkshop = workshopData.map(item => ({
            id: `workshop-${item.id}`,
            name: '📚 ' + (item.workshop?.name || 'Workshop'),
            date: item.registered_at,
            price: item.workshop?.price || 0,
            status: 'completed',
            type: 'Workshop',
            created_at: item.registered_at,
            original: item
          }));
          allTrans = [...allTrans, ...formattedWorkshop];
          
          totalSpent += workshopData.reduce((sum, w) => sum + (w.workshop?.price || 0), 0);
        }

        // ==========================================
        // 9. SORT & SET STATE
        // ==========================================
        console.log('📊 Total transactions before sort:', allTrans.length);
        allTrans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setAllTransactions(allTrans);
        console.log('✅ Transactions set:', allTrans.length);

        // 10. Set bookings
        const activeBookings = allTrans.filter(t => 
          t.type === 'Sewa RC' && ['active', 'confirmed'].includes(t.status)
        );
        setBookings(activeBookings.map(t => ({
          id: t.id,
          name: t.name,
          date: t.date,
          duration: t.duration || 1,
          status: t.status,
          price: t.price,
          category: t.category
        })));

        // 11. Set stats
        const totalBookings = allTrans.filter(t => t.type === 'Sewa RC').length;
        const activeCount = allTrans.filter(t => 
          t.type === 'Sewa RC' && ['active', 'confirmed'].includes(t.status)
        ).length;

        console.log('💰 Total spent:', totalSpent);
        console.log('📊 Stats:', { totalBookings, activeCount, totalSpent });

        setStats({
          totalBookings: totalBookings,
          activeBookings: activeCount,
          totalSpent: totalSpent,
          points: Math.floor(totalSpent / 1000) * 10
        });

      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Aktif', color: C.green, icon: CheckCircle },
      confirmed: { label: 'Dikonfirmasi', color: '#FFB020', icon: Clock },
      pending: { label: 'Pending', color: '#FFB020', icon: Clock },
      completed: { label: 'Selesai', color: C.steel, icon: CheckCircle },
      cancelled: { label: 'Dibatalkan', color: C.red, icon: XCircle },
      preparing: { label: 'Disiapkan', color: '#FFB020', icon: Clock },
      ready: { label: 'Siap', color: C.green, icon: CheckCircle },
    };
    return badges[status] || badges.pending;
  };

  const services = [
    { icon: Truck, label: 'Sewa RC', path: '/', color: C.amber },
    { icon: Wrench, label: 'Reparasi', path: '/reparasi', color: C.steel },
    { icon: GraduationCap, label: 'Workshop', path: '/workshop', color: '#FFB020' },
    { icon: Trophy, label: 'Kompetisi', path: '/kompetisi', color: C.green },
    { icon: UtensilsCrossed, label: 'Food Court', path: '/foodcourt', color: C.red },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.asphalt }}>
        <Loader2 size={40} className="animate-spin" style={{ color: C.amber }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.asphalt }}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b" style={{ borderColor: C.line, background: C.panel }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: C.amber }}>
              <Flag size={18} color={C.asphalt} />
            </div>
            <span className="f-display font-bold text-xl" style={{ color: C.paper }}>
              GASPOL<span style={{ color: C.amber }}>RC</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm flex items-center gap-1" style={{ color: C.steel }}>
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center f-display font-bold text-sm"
                style={{ background: C.amber, color: C.asphalt }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
            </button>
            <button onClick={handleLogout} className="text-sm" style={{ color: C.red }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute top-full left-0 right-0 border-b p-4" style={{ background: C.panel, borderColor: C.line }}>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium" style={{ color: C.paper }}>{user?.name}</div>
              <div className="text-xs" style={{ color: C.steel }}>{user?.email}</div>
              <button
                onClick={handleLogout}
                className="mt-2 text-sm text-left" style={{ color: C.red }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Profile */}
        <div className="rounded-lg border p-6 mb-8" style={{ borderColor: C.line, background: C.panel }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center f-display font-bold text-2xl"
              style={{ background: C.amber, color: C.asphalt }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="f-display font-bold text-xl" style={{ color: C.paper }}>
                {user?.name || 'Customer'}
              </h2>
              <p style={{ color: C.steel }}>{user?.email}</p>
              <p className="text-xs" style={{ color: C.steel }}>
                Member since {formatDate(user?.created_at || new Date())}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: C.asphalt }}>
                <Star size={14} fill={C.amber} color={C.amber} />
                <span className="text-sm font-medium" style={{ color: C.paper }}>4.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
            <div className="text-sm" style={{ color: C.steel }}>Total Transaksi</div>
            <div className="f-display font-bold text-2xl mt-1" style={{ color: C.paper }}>
              {allTransactions.length}
            </div>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
            <div className="text-sm" style={{ color: C.steel }}>Active Bookings</div>
            <div className="f-display font-bold text-2xl mt-1" style={{ color: C.green }}>
              {stats.activeBookings}
            </div>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
            <div className="text-sm" style={{ color: C.steel }}>Total Spent</div>
            <div className="f-display font-bold text-2xl mt-1" style={{ color: C.amber }}>
              {rupiah(stats.totalSpent)}
            </div>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
            <div className="text-sm" style={{ color: C.steel }}>Loyalty Points</div>
            <div className="f-display font-bold text-2xl mt-1" style={{ color: '#FFB020' }}>
              {stats.points.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Active Bookings */}
        <h3 className="f-display font-bold text-lg mb-4" style={{ color: C.paper }}>
          Booking Aktif
        </h3>
        <div className="space-y-3 mb-8">
          {bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length === 0 ? (
            <div className="rounded-lg border p-6 text-center" style={{ borderColor: C.line, background: C.panel }}>
              <p className="text-sm" style={{ color: C.steel }}>Tidak ada booking aktif.</p>
              <Link to="/" className="text-sm mt-2 inline-block" style={{ color: C.amber }}>
                Sewa RC Sekarang →
              </Link>
            </div>
          ) : (
            bookings.filter(b => b.status === 'active' || b.status === 'confirmed').map((booking) => {
              const badge = getStatusBadge(booking.status);
              return (
                <div
                  key={booking.id}
                  className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{ borderColor: C.line, background: C.panel }}
                >
                  <div>
                    <div className="font-semibold" style={{ color: C.paper }}>{booking.name}</div>
                    <div className="text-sm" style={{ color: C.steel }}>
                      <Calendar size={14} className="inline mr-1" />
                      {formatDate(booking.date)} · {booking.duration} hari
                      {booking.category && ` · ${booking.category}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span
                      className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
                      style={{ 
                        background: `${badge.color}20`, 
                        color: badge.color,
                        border: `1px solid ${badge.color}40`
                      }}
                    >
                      <badge.icon size={12} />
                      {badge.label}
                    </span>
                    <span className="f-mono font-bold" style={{ color: C.amber }}>
                      {rupiah(booking.price)}
                    </span>
                    {booking.status === 'active' && (
                      <button
                        className="px-3 py-1.5 rounded-md text-sm f-display font-bold uppercase"
                        style={{ background: C.amber, color: C.asphalt }}
                      >
                        Extend
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Access Services */}
        <h3 className="f-display font-bold text-lg mb-4" style={{ color: C.paper }}>
          Layanan Gaspol RC
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((service) => (
            <Link
              key={service.label}
              to={service.path}
              className="rounded-lg border p-4 text-center card-hover transition-all duration-200 hover:-translate-y-1"
              style={{ borderColor: C.line, background: C.panel }}
            >
              <service.icon size={28} className="mx-auto mb-2" style={{ color: service.color }} />
              <div className="text-sm font-medium" style={{ color: C.paper }}>{service.label}</div>
            </Link>
          ))}
        </div>

        {/* Riwayat Transaksi */}
        <h3 className="f-display font-bold text-lg mt-8 mb-4" style={{ color: C.paper }}>
          Riwayat Transaksi
        </h3>
        <div className="space-y-2">
          {allTransactions.length === 0 ? (
            <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
              <p className="text-sm" style={{ color: C.steel }}>Belum ada transaksi.</p>
            </div>
          ) : (
            allTransactions.map((tx) => {
              const badge = getStatusBadge(tx.status);
              const iconMap = {
                'Sewa RC': '🚗',
                'Food Court': '🍔',
                'Kompetisi': '🏆',
                'Workshop': '📚',
                'Reparasi': '🔧',
                'Toko RC': '🛒'
              };
              const icon = iconMap[tx.type] || '📦';
              
              return (
                <div
                  key={tx.id}
                  className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  style={{ borderColor: C.line, background: C.panel }}
                >
                  <div>
                    <div className="font-semibold text-sm" style={{ color: C.paper }}>
                      {icon} {tx.name}
                    </div>
                    <div className="text-xs" style={{ color: C.steel }}>
                      {formatDate(tx.date)} · {tx.type}
                      {tx.type === 'Sewa RC' && tx.duration && ` · ${tx.duration} hari`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ 
                        background: `${badge.color}20`, 
                        color: badge.color,
                        border: `1px solid ${badge.color}40`
                      }}
                    >
                      <badge.icon size={10} />
                      {badge.label}
                    </span>
                    <span className="f-mono font-bold text-sm" style={{ color: C.amber }}>
                      {rupiah(tx.price)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs border-t" style={{ borderColor: C.line, color: C.steel }}>
        GASPOL RC ARENA — Sewa · Toko · Reparasi · Workshop · Kompetisi · Food Court
      </footer>
    </div>
  );
};

export default CustomerDashboard;