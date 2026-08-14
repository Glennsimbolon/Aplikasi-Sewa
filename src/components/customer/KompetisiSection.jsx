// src/components/customer/KompetisiSection.jsx
import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { C } from '../../utils/constants';
import { rupiah } from '../../utils/helpers';
import { Calendar, Trophy, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const KompetisiSection = ({ onJoin }) => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompetitions = async () => {
      setLoading(true);
      try {
        // Ambil data dari Supabase
        const { data, error } = await supabase
          .from('kompetisi')
          .select('*')
          .order('date', { ascending: true });

        if (error) throw error;

        // Format data
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.name,
          tanggal: new Date(item.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          kuota: item.quota,
          terisi: item.registered || 0,
          hadiah: item.prize ? `Rp ${item.prize.toLocaleString('id-ID')}` : 'Rp 0',
          biaya: item.fee,
          status: item.status
        }));

        setCompetitions(formattedData);
      } catch (err) {
        console.error('Error loading competitions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCompetitions();
  }, []);

  if (loading) {
    return (
      <div>
        <SectionHeader eyebrow="Modul 5" title="Kompetisi" desc="Adu skill, kejar podium, bawa pulang hadiah." />
        <div className="flex justify-center py-12">
          <Loader2 size={40} className="animate-spin" style={{ color: C.amber }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <SectionHeader eyebrow="Modul 5" title="Kompetisi" desc="Adu skill, kejar podium, bawa pulang hadiah." />
        <div className="rounded-lg border p-6 text-center" style={{ borderColor: C.line, background: C.panel }}>
          <p className="text-sm" style={{ color: C.red }}>Gagal memuat data kompetisi: {error}</p>
        </div>
      </div>
    );
  }

  if (competitions.length === 0) {
    return (
      <div>
        <SectionHeader eyebrow="Modul 5" title="Kompetisi" desc="Adu skill, kejar podium, bawa pulang hadiah." />
        <div className="rounded-lg border p-6 text-center" style={{ borderColor: C.line, background: C.panel }}>
          <p className="text-sm" style={{ color: C.steel }}>Belum ada kompetisi yang tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader eyebrow="Modul 5" title="Kompetisi" desc="Adu skill, kejar podium, bawa pulang hadiah." />
      <div className="space-y-3">
        {competitions.map((k) => {
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
                  {k.status && <span className={`px-2 py-0.5 rounded-full text-[10px] ${k.status === 'open' ? 'bg-green/15 text-green' : k.status === 'upcoming' ? 'bg-yellow-500/15 text-yellow-500' : 'bg-steel/15 text-steel'}`}>{k.status}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="f-mono font-bold" style={{ color: C.paper }}>{rupiah(k.biaya)}</span>
                <button
                  disabled={full}
                  onClick={() => onJoin({ key: `kompetisi-${k.id}`, name: k.name, price: k.biaya, qty: 1, meta: "Kompetisi" })}
                  className="px-4 py-2 rounded-md f-display font-bold uppercase text-sm disabled:opacity-35 whitespace-nowrap transition hover:opacity-80"
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