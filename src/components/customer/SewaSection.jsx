// src/components/customer/SewaSection.jsx
import React, { useState } from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { C, CATEGORIES, STATUS_META } from '../../utils/constants';
import { rupiah } from '../../utils/helpers';
import { Zap, Star } from 'lucide-react';

// Mock data sementara
const FLEET = [
  { id: 1, name: "Titan Monster X1", cat: "Off-Road", scale: "1:8", speed: "42 km/j", price: 85000, status: "tersedia", rating: 4.9, unitTersisa: 4 },
  { id: 2, name: "Drift King GTX", cat: "Drift", scale: "1:10", speed: "55 km/j", price: 95000, status: "tersedia", rating: 4.8, unitTersisa: 2 },
  { id: 3, name: "Rally Storm R5", cat: "Rally", scale: "1:10", speed: "48 km/j", price: 90000, status: "disewa", rating: 4.7, unitTersisa: 0 },
  { id: 4, name: "SkyHawk FPV", cat: "Drone", scale: "220mm", speed: "80 km/j", price: 120000, status: "tersedia", rating: 4.9, unitTersisa: 3 },
  { id: 5, name: "Crawler Beast 4x4", cat: "Crawler", scale: "1:10", speed: "18 km/j", price: 75000, status: "servis", rating: 4.6, unitTersisa: 0 },
  { id: 6, name: "Micro Racer Nano", cat: "Mini Racer", scale: "1:16", speed: "30 km/j", price: 45000, status: "tersedia", rating: 4.7, unitTersisa: 6 },
  { id: 7, name: "Dune Raptor V2", cat: "Off-Road", scale: "1:8", speed: "50 km/j", price: 99000, status: "tersedia", rating: 5.0, unitTersisa: 2 },
  { id: 8, name: "Track Phantom", cat: "Drift", scale: "1:10", speed: "58 km/j", price: 98000, status: "tersedia", rating: 4.8, unitTersisa: 1 },
];

export const SewaSection = ({ category, setCategory, onBook }) => {
  const filteredFleet = category === "Semua" ? FLEET : FLEET.filter(f => f.cat === category);

  return (
    <div>
      <SectionHeader 
        eyebrow="Modul 1" 
        title="Sewa RC" 
        desc="Pilih unit, tentukan durasi, langsung booking. Status unit real-time." 
      />
      
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="px-4 py-1.5 rounded-full text-sm f-display font-semibold whitespace-nowrap border"
            style={{
              borderColor: category === c ? C.amber : C.line,
              color: category === c ? C.amber : C.steel,
              background: category === c ? "rgba(255,106,19,0.1)" : "transparent",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFleet.map((unit) => {
          const meta = STATUS_META[unit.status];
          const disabled = unit.status !== "tersedia";
          return (
            <div
              key={unit.id}
              className="rounded-lg border overflow-hidden card-hover flex flex-col"
              style={{ borderColor: C.line, background: C.panel }}
            >
              <div
                className="h-32 flex items-center justify-center relative stripe-bg"
                style={{ background: `linear-gradient(135deg, ${C.asphalt2}, ${C.asphalt})` }}
              >
                <Zap size={40} color={C.line} strokeWidth={1.5} />
                <div
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] f-display font-bold uppercase"
                  style={{ background: "rgba(15,17,19,0.8)", color: meta.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                  {meta.label}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs f-display uppercase font-semibold" style={{ color: C.amber }}>{unit.cat}</div>
                <div className="font-semibold mt-0.5" style={{ color: C.paper }}>{unit.name}</div>
                <div className="flex items-center gap-2 text-xs mt-1.5" style={{ color: C.steel }}>
                  <span>{unit.scale}</span><span>·</span><span>{unit.speed}</span>
                  <span className="flex items-center gap-0.5 ml-auto">
                    <Star size={12} fill={C.amber} color={C.amber} />{unit.rating}
                  </span>
                </div>
                <div className="mt-3 f-mono font-bold" style={{ color: C.paper }}>
                  {rupiah(unit.price)}<span className="text-xs font-normal" style={{ color: C.steel }}> /hari</span>
                </div>
                <button
                  disabled={disabled}
                  onClick={() => onBook(unit)}
                  className="mt-3 w-full py-2 rounded-md f-display font-bold uppercase text-sm disabled:opacity-35"
                  style={{ background: disabled ? C.line : C.amber, color: disabled ? C.steel : C.asphalt }}
                >
                  {disabled ? meta.label : "Booking"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};