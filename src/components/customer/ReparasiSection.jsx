// src/components/customer/ReparasiSection.jsx
import React, { useState } from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { C } from '../../utils/constants';
import { rupiah } from '../../utils/helpers';
import { Wrench } from 'lucide-react';

const SERVICES = [
  { id: 1, name: "Servis Ringan (cek & bersih)", price: 50000, durasi: "1 hari" },
  { id: 2, name: "Ganti Ban / Velg", price: 90000, durasi: "1 hari" },
  { id: 3, name: "Upgrade Motor & ESC", price: 350000, durasi: "2-3 hari" },
  { id: 4, name: "Rebuild Chassis Total", price: 650000, durasi: "3-5 hari" },
];

export const ReparasiSection = ({ onOrder }) => {
  const [selected, setSelected] = useState(SERVICES[0].id);
  const service = SERVICES.find((s) => s.id === selected);

  return (
    <div>
      <SectionHeader eyebrow="Modul 3" title="Reparasi & Modifikasi" desc="Pilih jenis servis, lihat estimasi biaya & waktu pengerjaan." />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className="w-full text-left p-3.5 rounded-md border flex items-center justify-between"
              style={{
                borderColor: selected === s.id ? C.amber : C.line,
                background: selected === s.id ? "rgba(255,106,19,0.1)" : C.panel,
              }}
            >
              <div>
                <div className="font-semibold text-sm" style={{ color: C.paper }}>{s.name}</div>
                <div className="text-xs mt-0.5" style={{ color: C.steel }}>Estimasi {s.durasi}</div>
              </div>
              <div className="f-mono font-bold text-sm" style={{ color: C.amber }}>{rupiah(s.price)}</div>
            </button>
          ))}
        </div>
        <div className="rounded-lg border p-5 h-fit" style={{ borderColor: C.line, background: C.panel }}>
          <Wrench size={22} color={C.amber} />
          <div className="f-display font-bold text-lg mt-3" style={{ color: C.paper }}>{service.name}</div>
          <div className="text-sm mt-1" style={{ color: C.steel }}>Estimasi pengerjaan {service.durasi}</div>
          <div className="flex items-center justify-between mt-5 pt-4 border-t" style={{ borderColor: C.line }}>
            <span className="text-sm" style={{ color: C.steel }}>Estimasi biaya</span>
            <span className="f-mono font-bold text-lg" style={{ color: C.amber }}>{rupiah(service.price)}</span>
          </div>
          <button
            onClick={() => onOrder({ key: `reparasi-${service.id}`, name: service.name, price: service.price, qty: 1, meta: "Reparasi" })}
            className="mt-5 w-full py-2.5 rounded-md f-display font-bold uppercase text-sm"
            style={{ background: C.amber, color: C.asphalt }}
          >
            Ajukan Servis
          </button>
        </div>
      </div>
    </div>
  );
};