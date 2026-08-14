// src/components/customer/WorkshopSection.jsx
import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { C } from '../../utils/constants';
import { rupiah } from '../../utils/helpers';
import { Calendar } from 'lucide-react';

const CLASSES = [
  { id: 1, name: "Basic Handling RC 101", jadwal: "Sabtu, 09.00", kuota: 12, terisi: 8, harga: 150000, level: "Pemula" },
  { id: 2, name: "Drift Technique Intensif", jadwal: "Minggu, 13.00", kuota: 8, terisi: 7, harga: 250000, level: "Menengah" },
  { id: 3, name: "Setup & Tuning Kompetisi", jadwal: "Sabtu, 15.00", kuota: 6, terisi: 2, harga: 400000, level: "Lanjutan" },
];

export const WorkshopSection = ({ onJoin }) => {
  return (
    <div>
      <SectionHeader eyebrow="Modul 4" title="Workshop & Edukasi" desc="Belajar dari basic handling sampai tuning kompetisi." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CLASSES.map((c) => {
          const pct = Math.round((c.terisi / c.kuota) * 100);
          const full = c.terisi >= c.kuota;
          return (
            <div key={c.id} className="rounded-lg border p-4 flex flex-col card-hover" style={{ borderColor: C.line, background: C.panel }}>
              <div className="text-xs f-display uppercase font-semibold" style={{ color: C.amber }}>{c.level}</div>
              <div className="font-semibold mt-1" style={{ color: C.paper }}>{c.name}</div>
              <div className="flex items-center gap-1.5 text-xs mt-2" style={{ color: C.steel }}>
                <Calendar size={13} /> {c.jadwal}
              </div>
              <div className="mt-3">
                <div className="h-1.5 rounded-full" style={{ background: C.line }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: full ? C.red : C.green }} />
                </div>
                <div className="text-xs mt-1.5" style={{ color: C.steel }}>{c.terisi}/{c.kuota} peserta terdaftar</div>
              </div>
              <div className="f-mono font-bold mt-3" style={{ color: C.paper }}>{rupiah(c.harga)}</div>
              <button
                disabled={full}
                onClick={() => onJoin({ key: `kelas-${c.id}`, name: c.name, price: c.harga, qty: 1, meta: "Workshop" })}
                className="mt-3 w-full py-2 rounded-md f-display font-bold uppercase text-sm disabled:opacity-35"
                style={{ background: full ? C.line : C.amber, color: full ? C.steel : C.asphalt }}
              >
                {full ? "Kuota Penuh" : "Daftar Kelas"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};