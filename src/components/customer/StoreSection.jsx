// src/components/customer/StoreSection.jsx
import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { C } from '../../utils/constants';
import { rupiah } from '../../utils/helpers';

const STORE_ITEMS = [
  { id: 1, name: "Titan Monster X1 - Unit Baru", price: 3250000, note: "Termasuk baterai & charger" },
  { id: 2, name: "Drift King GTX - Unit Baru", price: 3650000, note: "Ban drift spec + spare body" },
  { id: 3, name: "SkyHawk FPV - Kit Lengkap", price: 4890000, note: "Goggle FPV + 3 baterai" },
  { id: 4, name: "Sparepart Ban Off-Road (4pcs)", price: 185000, note: "Kompatibel semua tipe 1:8/1:10" },
];

export const StoreSection = ({ onBuy }) => {
  return (
    <div>
      <SectionHeader eyebrow="Modul 2" title="Toko RC" desc="Punya sendiri, bukan cuma sewa. Unit baru & sparepart siap kirim." />
      <div className="grid sm:grid-cols-2 gap-4">
        {STORE_ITEMS.map((it) => (
          <div key={it.id} className="rounded-lg border p-4 flex items-center justify-between card-hover" style={{ borderColor: C.line, background: C.panel }}>
            <div>
              <div className="font-semibold" style={{ color: C.paper }}>{it.name}</div>
              <div className="text-xs mt-1" style={{ color: C.steel }}>{it.note}</div>
              <div className="f-mono font-bold mt-2" style={{ color: C.amber }}>{rupiah(it.price)}</div>
            </div>
            <button
              onClick={() => onBuy({ key: `store-${it.id}`, name: it.name, price: it.price, qty: 1, meta: "Toko RC" })}
              className="px-4 py-2 rounded-md f-display font-bold uppercase text-sm shrink-0"
              style={{ background: C.amber, color: C.asphalt }}
            >
              Beli
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};