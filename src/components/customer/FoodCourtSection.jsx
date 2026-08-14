// src/components/customer/FoodCourtSection.jsx
import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { C } from '../../utils/constants';
import { rupiah } from '../../utils/helpers';
import { Plus, ShoppingCart } from 'lucide-react';

const MENU = [
  { id: 1, name: "Nasi Goreng Pit Stop", price: 28000, cat: "Berat" },
  { id: 2, name: "Ayam Geprek Chicane", price: 26000, cat: "Berat" },
  { id: 3, name: "Es Teh Turbo", price: 8000, cat: "Minuman" },
  { id: 4, name: "Kopi Susu Gaspol", price: 15000, cat: "Minuman" },
  { id: 5, name: "Kentang Goreng Podium", price: 18000, cat: "Snack" },
];

export const FoodCourtSection = ({ order, onAdd, total, onCheckout }) => {
  return (
    <div>
      <SectionHeader 
        eyebrow="Modul 6" 
        title="Food Court" 
        desc="Sambil nunggu unit siap dipacu, isi bensin dulu." 
      />
      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        {/* Menu List */}
        <div className="grid sm:grid-cols-2 gap-3">
          {MENU.map((m) => (
            <div key={m.id} className="rounded-lg border p-3.5 flex items-center justify-between" 
                 style={{ borderColor: C.line, background: C.panel }}>
              <div>
                <div className="text-[11px] f-display uppercase font-semibold" style={{ color: C.amber }}>{m.cat}</div>
                <div className="font-semibold text-sm" style={{ color: C.paper }}>{m.name}</div>
                <div className="f-mono text-sm mt-1" style={{ color: C.steelLight }}>{rupiah(m.price)}</div>
              </div>
              <button
                onClick={() => onAdd(m)}
                className="w-8 h-8 rounded-md flex items-center justify-center hover:opacity-80 transition"
                style={{ background: C.amber, color: C.asphalt }}
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary - Dengan Tombol Checkout! */}
        <div className="rounded-lg border p-4 h-fit" style={{ borderColor: C.line, background: C.panel }}>
          <div className="f-display font-bold uppercase text-sm mb-3" style={{ color: C.steel }}>
            🛒 Pesanan Kamu
          </div>
          
          {order.length === 0 ? (
            <div className="text-sm" style={{ color: C.steel }}>Belum ada pesanan.</div>
          ) : (
            <>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {order.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm" style={{ color: C.paper }}>
                    <span>{o.name} × {o.qty}</span>
                    <span className="f-mono" style={{ color: C.steelLight }}>{rupiah(o.price * o.qty)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t font-bold" style={{ borderColor: C.line }}>
                <span className="text-sm" style={{ color: C.steel }}>Total</span>
                <span className="f-mono" style={{ color: C.amber }}>{rupiah(total)}</span>
              </div>
              
              {/* ===== TOMBOL CHECKOUT FOOD COURT ===== */}
              <button
                onClick={onCheckout}
                className="w-full mt-4 py-3 rounded-md f-display font-bold uppercase text-sm flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background: C.amber, color: C.asphalt }}
              >
                <ShoppingCart size={18} />
                Pesan Sekarang
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};