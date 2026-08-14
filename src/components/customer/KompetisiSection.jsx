// src/components/customer/KompetisiSection.jsx
import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { C } from '../../utils/constants';
import { rupiah } from '../../utils/helpers';
import { Calendar, Trophy } from 'lucide-react';

const COMPETITIONS = [
  { id: 1, name: "Weekend Off-Road Sprint", tanggal: "23 Agu 2026", kuota: 24, terisi: 19, hadiah: "Rp 3.000.000", biaya: 75000 },
  { id: 2, name: "Drift Battle Arena Cup", tanggal: "30 Agu 2026", kuota: 16, terisi: 16, hadiah: "Rp 5.000.000", biaya: 100000 },
  { id: 3, name: "FPV Drone Time Attack", tanggal: "6 Sep 2026", kuota: 20, terisi: 5, hadiah: "Rp 2.500.000", biaya: 60000 },
];

export const KompetisiSection = ({ onJoin }) => {
  return (
    <div>
      <SectionHeader eyebrow="Modul 5" title="Kompetisi" desc="Adu skill, kejar podium, bawa pulang hadiah." />
      <div className="space-y-3">
        {COMPETITIONS.map((k) => {
          const full = k.terisi >= k.kuota;
          return (
            <div key={k.id} className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-4" style={{ borderColor: C.line, background: C.panel }}>
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2" style={{ color: C.paper }}>
                  <Trophy size={16} color={C.amber} /> {k.name}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2" style={{ color: C.steel }}>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {k.tanggal}</span>
                  <span>{k.terisi}/{k.kuota} peserta</span>
                  <span>Hadiah {k.hadiah}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="f-mono font-bold" style={{ color: C.paper }}>{rupiah(k.biaya)}</span>
                <button
                  disabled={full}
                  onClick={() => onJoin({ key: `kompetisi-${k.id}`, name: k.name, price: k.biaya, qty: 1, meta: "Kompetisi" })}
                  className="px-4 py-2 rounded-md f-display font-bold uppercase text-sm disabled:opacity-35 whitespace-nowrap"
                  style={{ background: full ? C.line : C.amber, color: full ? C.steel : C.asphalt }}
                >
                  {full ? "Penuh" : "Daftar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};