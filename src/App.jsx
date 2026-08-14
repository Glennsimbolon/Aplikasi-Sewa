import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// ==========================================
// Supabase
// ==========================================
import { supabase } from './lib/supabase';

// ==========================================
// Context Providers
// ==========================================
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

// ==========================================
// Styles
// ==========================================
import './styles/globals.css';
import './styles/fonts.css';

// ==========================================
// Components
// ==========================================
import Modal from './components/common/Modal';
import { SectionHeader } from './components/common/SectionHeader';
import { PublicLayout } from './components/layout/PublicLayout';
import { SewaSection } from './components/customer/SewaSection';
import { StoreSection } from './components/customer/StoreSection';
import { ReparasiSection } from './components/customer/ReparasiSection';
import { WorkshopSection } from './components/customer/WorkshopSection';
import { KompetisiSection } from './components/customer/KompetisiSection';
import { FoodCourtSection } from './components/customer/FoodCourtSection';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import SewaManagement from './components/admin/sewa/SewaManagement';

// Customer
import CustomerDashboard from './components/customer/CustomerDashboard';

// ==========================================
// Utils
// ==========================================
import { C, MODULES } from './utils/constants';
import { rupiah } from './utils/helpers';
import { 
  Flag, 
  ShoppingCart, 
  X, 
  Check,
  ArrowRight,
  Trophy,
  ShieldCheck,
  Gauge,
  Clock,
  Star
} from 'lucide-react';

// ==========================================
// MAIN APP COMPONENT
// ==========================================
function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const { 
    cart, 
    cartOpen, 
    setCartOpen, 
    addToCart, 
    removeFromCart, 
    clearCart,
    totalItems,
    totalPrice 
  } = useCart();
  
  const navigate = useNavigate();
  
  // ==========================================
  // STATE
  // ==========================================
  const [activeModule, setActiveModule] = useState('sewa');
  const [category, setCategory] = useState('Semua');
  const [bookingUnit, setBookingUnit] = useState(null);
  const [duration, setDuration] = useState(1);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [foodOrder, setFoodOrder] = useState([]);
  const [fleetData, setFleetData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FUNCTIONS
  // ==========================================
  const addFood = (item) => {
    setFoodOrder(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const foodTotal = foodOrder.reduce((s, i) => s + i.price * i.qty, 0);

  const confirmBooking = () => {
    if (!bookingUnit) return;
    addToCart({
      key: `sewa-${bookingUnit.id}-${duration}`,
      name: `${bookingUnit.name} · ${duration} hari`,
      price: bookingUnit.price * duration,
      qty: 1,
      meta: "Sewa RC",
    });
    setBookingUnit(null);
    setDuration(1);
  };

// ==========================================
// HANDLE KOMPETISI CHECKOUT
// ==========================================
const handleKompetisiCheckout = async () => {
  if (cart.length === 0) return;
  
  if (!user) {
    toast.error('Silakan login terlebih dahulu!');
    return;
  }
  
  try {
    for (const item of cart) {
      if (item.meta === 'Kompetisi') {
        // Parse data dari key: kompetisi-{kompetisiId}
        const parts = item.key.split('-');
        const kompetisiId = parseInt(parts[1]);
        
        // Simpan ke tabel kompetisi_participants
        const { data, error } = await supabase
          .from('kompetisi_participants')
          .insert([{
            kompetisi_id: kompetisiId,
            user_id: user.id,
            status: 'registered'
          }]);
        
        if (error) {
          console.error('Kompetisi registration error:', error);
          toast.error('Gagal daftar kompetisi: ' + error.message);
          return;
        }
        
        console.log('✅ Kompetisi registration saved:', data);
      }
    }
    
    setCheckoutDone(true);
    clearCart();
    setCartOpen(false);
    toast.success('Pendaftaran kompetisi berhasil!');
    
  } catch (error) {
    console.error('Kompetisi checkout error:', error);
    toast.error('Terjadi kesalahan saat checkout');
  }
};
// ==========================================
// HANDLE CHECKOUT - SEMUA MODUL!
// ==========================================
const handleCheckout = async () => {
  // Cek apakah ada item di cart atau food order
  if (cart.length === 0 && foodOrder.length === 0) {
    toast.error('Tidak ada pesanan!');
    return;
  }
  
  if (!user) {
    toast.error('Silakan login terlebih dahulu!');
    return;
  }
  
  try {
    // ==========================================
    // 1. PROSES CART (Sewa RC, Store, Reparasi, Workshop, Kompetisi)
    // ==========================================
    for (const item of cart) {
      // ----- SEWA RC -----
      if (item.meta === 'Sewa RC') {
        const parts = item.key.split('-');
        const fleetId = parseInt(parts[1]);
        const duration = parseInt(parts[2]);
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);
        
        const { data, error } = await supabase
          .from('bookings')
          .insert([{
            user_id: user.id,
            fleet_id: fleetId,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            total_price: item.price,
            status: 'active',
            payment_status: 'paid'
          }]);
        
        if (error) {
          console.error('Booking error:', error);
          toast.error('Gagal menyimpan booking: ' + error.message);
          return;
        }
        console.log('✅ Booking saved:', data);
      }
      
      // ----- TOKO RC (Store) -----
      else if (item.meta === 'Toko RC') {
        // Simpan ke tabel orders atau products
        const { data, error } = await supabase
          .from('orders')
          .insert([{
            user_id: user.id,
            product_name: item.name,
            price: item.price,
            qty: item.qty || 1,
            status: 'completed',
            payment_status: 'paid'
          }]);
        
        if (error) {
          console.error('Store order error:', error);
          toast.error('Gagal menyimpan order: ' + error.message);
          return;
        }
        console.log('✅ Store order saved:', data);
      }
      
      // ----- REPARASI -----
      else if (item.meta === 'Reparasi') {
        const parts = item.key.split('-');
        const serviceId = parseInt(parts[1]);
        
        // Ambil data service
        const { data: service, error: fetchError } = await supabase
          .from('reparasi')
          .select('*')
          .eq('id', serviceId)
          .single();
        
        if (fetchError) {
          console.error('Service fetch error:', fetchError);
          toast.error('Gagal mengambil data service');
          return;
        }
        
        // Buat order reparasi
        const { data, error } = await supabase
          .from('reparasi_orders')
          .insert([{
            user_id: user.id,
            service_id: serviceId,
            service_name: service.service_name || item.name,
            price: service.price || item.price,
            status: 'pending'
          }]);
        
        if (error) {
          console.error('Reparasi error:', error);
          toast.error('Gagal order reparasi: ' + error.message);
          return;
        }
        console.log('✅ Reparasi order saved:', data);
      }
      
      // ----- WORKSHOP -----
      else if (item.meta === 'Workshop') {
        const parts = item.key.split('-');
        const workshopId = parseInt(parts[1]);
        
        // Ambil data workshop
        const { data: workshop, error: fetchError } = await supabase
          .from('workshop')
          .select('registered, quota')
          .eq('id', workshopId)
          .single();
        
        if (fetchError) {
          console.error('Workshop fetch error:', fetchError);
          toast.error('Gagal mengambil data workshop');
          return;
        }
        
        if (workshop.registered >= workshop.quota) {
          toast.error('Kuota workshop sudah penuh!');
          return;
        }
        
        // Update registered count
        const { data, error } = await supabase
          .from('workshop')
          .update({ registered: workshop.registered + 1 })
          .eq('id', workshopId)
          .select();
        
        if (error) {
          console.error('Workshop error:', error);
          toast.error('Gagal daftar workshop: ' + error.message);
          return;
        }
        console.log('✅ Workshop registration saved:', data);
      }
      
      // ----- KOMPETISI -----
      else if (item.meta === 'Kompetisi') {
        const parts = item.key.split('-');
        const kompetisiId = parseInt(parts[1]);
        
        const { data, error } = await supabase
          .from('kompetisi_participants')
          .insert([{
            kompetisi_id: kompetisiId,
            user_id: user.id,
            status: 'registered'
          }]);
        
        if (error) {
          console.error('Kompetisi error:', error);
          toast.error('Gagal daftar kompetisi: ' + error.message);
          return;
        }
        console.log('✅ Kompetisi registration saved:', data);
      }
    }
    
    // ==========================================
    // 2. PROSES FOOD ORDER
    // ==========================================
    if (foodOrder.length > 0) {
      const subtotal = foodOrder.reduce((sum, item) => sum + item.price * item.qty, 0);
      const tax = Math.round(subtotal * 0.11);
      const totalPrice = subtotal + tax;
      
      let tenantId = 1;
      try {
        const { data: tenants } = await supabase
          .from('tenants')
          .select('id')
          .limit(1);
        
        if (tenants && tenants.length > 0) {
          tenantId = tenants[0].id;
        }
      } catch (err) {
        console.warn('Error getting tenant, using default:', err);
      }
      
      const { data, error } = await supabase
        .from('food_orders')
        .insert([{
          tenant_id: tenantId,
          user_id: user.id,
          items: foodOrder.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            cat: item.cat
          })),
          subtotal: subtotal,
          tax: tax,
          total_price: totalPrice,
          status: 'pending',
          payment_status: 'paid'
        }]);
      
      if (error) {
        console.error('Food order error:', error);
        toast.error('Gagal memesan makanan: ' + error.message);
        return;
      }
      console.log('✅ Food order saved:', data);
      setFoodOrder([]);
    }
    
    // ==========================================
    // 3. SUCCESS
    // ==========================================
    setCheckoutDone(true);
    clearCart();
    setCartOpen(false);
    toast.success('Semua pesanan berhasil! Cek dashboard kamu.');
    
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Terjadi kesalahan saat checkout');
  }
};
  // ==========================================
  // RENDER MODULES
  // ==========================================
  const renderModule = () => {
    switch (activeModule) {
      case 'sewa':
        return (
          <SewaSection
            category={category}
            setCategory={setCategory}
            onBook={(unit) => setBookingUnit(unit)}
          />
        );
      case 'store':
        return <StoreSection onBuy={addToCart} />;
      case 'reparasi':
        return <ReparasiSection onOrder={addToCart} />;
      case 'workshop':
        return <WorkshopSection onJoin={addToCart} />;
      case 'kompetisi':
        return <KompetisiSection onJoin={addToCart} />;
      case 'foodcourt':
        return (
          <FoodCourtSection 
            order={foodOrder} 
            onAdd={addFood} 
            total={foodTotal}
            onCheckout={handleFoodCheckout}
          />
        );
      default:
        return null;
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen f-body" style={{ background: C.asphalt, color: C.paper }}>
      {/* ===== TOP BAR ===== */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: "rgba(15,17,19,0.92)", backdropFilter: "blur(6px)", borderColor: C.line }}
      >
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center"
              style={{ background: C.amber }}
            >
              <Flag size={18} color={C.asphalt} />
            </div>
            <div className="f-display font-bold text-xl leading-none tracking-wide">
              GASPOL<span style={{ color: C.amber }}>RC</span>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6 f-display text-[15px] font-semibold uppercase tracking-wide">
            {MODULES.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`tab-underline pb-1 ${activeModule === m.id ? 'active' : ''}`}
                style={{ color: activeModule === m.id ? C.paper : C.steel }}
              >
                {m.label}
              </button>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1 rounded-md text-sm"
                style={{ background: C.amber, color: C.asphalt }}
              >
                Dashboard
              </button>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1 rounded-md text-sm border"
                style={{ borderColor: C.line, color: C.paper }}
              >
                Login
              </button>
            )}
          </nav>

          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-3 py-2 rounded-md border"
            style={{ borderColor: C.line, background: C.panel }}
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline f-mono text-sm">{rupiah(totalPrice)}</span>
            {totalItems > 0 && (
              <span
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold"
                style={{ background: C.amber, color: C.asphalt }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-2 overflow-x-auto px-5 pb-3 f-display text-sm font-semibold uppercase">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className="px-3 py-1.5 rounded-full whitespace-nowrap border"
              style={{
                borderColor: activeModule === m.id ? C.amber : C.line,
                background: activeModule === m.id ? "rgba(255,106,19,0.12)" : "transparent",
                color: activeModule === m.id ? C.amber : C.steel,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden stripe-bg" style={{ background: C.asphalt2 }}>
        <div className="max-w-6xl mx-auto px-5 pt-14 pb-10 grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold f-mono mb-5"
              style={{ background: "rgba(60,193,122,0.12)", color: C.green, border: `1px solid rgba(60,193,122,0.3)` }}
            >
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: C.green }} />
              12 UNIT SIAP GAS HARI INI
            </div>
            <h1 className="f-display font-bold leading-[0.95] text-5xl md:text-6xl">
              SEWA. PACU.
              <br />
              <span style={{ color: C.amber }}>MENANG.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg max-w-md" style={{ color: C.steelLight }}>
              Satu platform untuk sewa RC, servis, workshop, kompetisi, sampai jajan di pit stop.
              Booking dalam hitungan detik, ambil unit, langsung gaspol.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveModule('sewa')}
                className="f-display font-bold uppercase px-6 py-3 rounded-md flex items-center gap-2"
                style={{ background: C.amber, color: C.asphalt }}
              >
                Booking RC Sekarang <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setActiveModule('kompetisi')}
                className="f-display font-bold uppercase px-6 py-3 rounded-md border flex items-center gap-2"
                style={{ borderColor: C.line, color: C.paper }}
              >
                Lihat Kompetisi <Trophy size={16} />
              </button>
            </div>
          </div>

          {/* Circuit SVG */}
          <div className="relative">
            <svg viewBox="0 0 320 260" className="w-full h-auto">
              <path
                d="M40 30 H240 A30 30 0 0 1 270 60 V90 A30 30 0 0 1 240 120 H80 A30 30 0 0 0 50 150 V180 A30 30 0 0 0 80 210 H280"
                fill="none"
                stroke={C.line}
                strokeWidth="3"
              />
              <path
                d="M40 30 H240 A30 30 0 0 1 270 60 V90 A30 30 0 0 1 240 120 H80 A30 30 0 0 0 50 150 V180 A30 30 0 0 0 80 210 H280"
                fill="none"
                stroke={C.amber}
                strokeWidth="3"
                className="track-line"
              />
              {[
                { x: 40, y: 30 },
                { x: 240, y: 30 },
                { x: 270, y: 90 },
                { x: 80, y: 120 },
                { x: 50, y: 180 },
                { x: 280, y: 210 },
              ].map((p, i) => {
                const m = MODULES[i];
                const active = activeModule === m.id;
                return (
                  <g
                    key={m.id}
                    transform={`translate(${p.x},${p.y})`}
                    onClick={() => setActiveModule(m.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle r="16" fill={active ? C.amber : C.panel} stroke={active ? C.amber : C.line} strokeWidth="2" />
                    <circle r="4" fill={active ? C.asphalt : C.steel} />
                  </g>
                );
              })}
            </svg>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 f-display text-xs uppercase font-semibold" style={{ color: C.steel }}>
              {MODULES.map((m) => (
                <div key={m.id} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeModule === m.id ? C.amber : C.line }} />
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-5 py-12">
        {renderModule()}
      </main>

      {/* ===== ADVANTAGES ===== */}
      <section className="border-t" style={{ borderColor: C.line, background: C.asphalt2 }}>
        <div className="max-w-6xl mx-auto px-5 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: "Satu Platform Terintegrasi", desc: "Stok, transaksi & laporan tersambung real-time." },
            { icon: Gauge, title: "Stok Terpadu", desc: "Satu gudang untuk sewa, toko, dan marketplace." },
            { icon: Clock, title: "Booking Instan", desc: "Pilih unit, bayar, ambil — tanpa antre panjang." },
            { icon: Trophy, title: "Ekosistem Komunitas", desc: "Dari sewa santai sampai naik podium kompetisi." },
          ].map((f, i) => (
            <div key={i}>
              <f.icon size={22} color={C.amber} />
              <div className="f-display font-bold mt-3 text-lg">{f.title}</div>
              <div className="text-sm mt-1" style={{ color: C.steel }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-xs f-mono" style={{ color: C.steel }}>
        GASPOL RC ARENA — Sewa · Toko · Reparasi · Workshop · Kompetisi · Food Court
      </footer>

      {/* ===== BOOKING MODAL ===== */}
      {bookingUnit && (
        <Modal onClose={() => setBookingUnit(null)} title={bookingUnit.cat}>
          <h3 className="f-display font-bold text-2xl mt-1">{bookingUnit.name}</h3>
          <div className="flex items-center gap-3 mt-2 text-sm" style={{ color: C.steel }}>
            <span>Skala {bookingUnit.scale}</span>
            <span>·</span>
            <span>{bookingUnit.speed}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Star size={13} fill={C.amber} color={C.amber} /> {bookingUnit.rating}
            </span>
          </div>

          <div className="mt-6">
            <div className="text-xs f-display uppercase font-semibold mb-2" style={{ color: C.steel }}>
              Durasi sewa
            </div>
            <div className="flex gap-2">
              {[1, 3, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className="flex-1 py-2.5 rounded-md border f-display font-semibold transition"
                  style={{
                    borderColor: duration === d ? C.amber : C.line,
                    background: duration === d ? "rgba(255,106,19,0.12)" : "transparent",
                    color: duration === d ? C.amber : C.paper,
                  }}
                >
                  {d} Hari
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between p-4 rounded-md" style={{ background: C.panel }}>
            <span className="text-sm" style={{ color: C.steel }}>Total biaya sewa</span>
            <span className="f-mono font-bold text-lg" style={{ color: C.amber }}>
              {rupiah(bookingUnit.price * duration)}
            </span>
          </div>

          <button
            onClick={confirmBooking}
            className="mt-5 w-full py-3 rounded-md f-display font-bold uppercase flex items-center justify-center gap-2"
            style={{ background: C.amber, color: C.asphalt }}
          >
            Tambah ke Troli <ShoppingCart size={16} />
          </button>
        </Modal>
      )}

      {/* ===== CART DRAWER ===== */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setCartOpen(false)} />
          <div
            className="relative w-full max-w-sm h-full flex flex-col border-l"
            style={{ background: C.asphalt2, borderColor: C.line }}
          >
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: C.line }}>
              <div className="f-display font-bold text-xl">Troli Kamu</div>
              <button onClick={() => setCartOpen(false)}><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 && (
                <div className="text-sm text-center py-16" style={{ color: C.steel }}>
                  Troli masih kosong. Pilih unit RC atau layanan dulu, gaspol!
                </div>
              )}
              {cart.map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-md border flex items-start justify-between gap-2"
                  style={{ borderColor: C.line, background: C.panel }}
                >
                  <div>
                    <div className="text-xs f-display uppercase font-semibold" style={{ color: C.amber }}>{item.meta}</div>
                    <div className="font-semibold text-sm mt-0.5">{item.name}</div>
                    <div className="f-mono text-sm mt-1" style={{ color: C.steelLight }}>
                      {rupiah(item.price)} {item.qty > 1 ? `× ${item.qty}` : ""}
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.key)} style={{ color: C.steel }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-5 border-t" style={{ borderColor: C.line }}>
              <div className="flex items-center justify-between mb-4">
                <span className="f-display font-semibold uppercase text-sm" style={{ color: C.steel }}>Total</span>
                <span className="f-mono font-bold text-xl" style={{ color: C.amber }}>{rupiah(totalPrice)}</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-3 rounded-md f-display font-bold uppercase disabled:opacity-40"
                style={{ background: C.amber, color: C.asphalt }}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHECKOUT SUCCESS ===== */}
      {checkoutDone && (
        <Modal onClose={() => setCheckoutDone(false)}>
          <div className="text-center py-4">
            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
              style={{ background: "rgba(60,193,122,0.15)" }}
            >
              <Check size={28} color={C.green} />
            </div>
            <h3 className="f-display font-bold text-2xl mt-4">Pesanan Terkonfirmasi</h3>
            <p className="text-sm mt-2" style={{ color: C.steel }}>
              Cek WhatsApp untuk struk & instruksi ambil unit di lokasi terdekat kamu.
            </p>
            <button
              onClick={() => setCheckoutDone(false)}
              className="mt-6 px-6 py-2.5 rounded-md f-display font-bold uppercase"
              style={{ background: C.amber, color: C.asphalt }}
            >
              Oke, Gaspol!
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ==========================================
// MAIN APP WITH ROUTING
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1D2023',
                color: '#F3F1EA',
                border: '1px solid #2B2F33'
              },
              success: {
                style: {
                  borderColor: '#3CC17A'
                }
              },
              error: {
                style: {
                  borderColor: '#E8493B'
                }
              }
            }}
          />
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="sewa" element={<SewaManagement />} />
            </Route>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}