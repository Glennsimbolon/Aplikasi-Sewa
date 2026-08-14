import React, { useState, useEffect } from 'react'
import { sewaService } from '../../../services'
import { C, STATUS_META } from '../../../utils/constants'
import { rupiah } from '../../../utils/helpers'
import { Plus, Edit2, Trash2, Search, Star } from 'lucide-react'
import Modal from '../../common/Modal'
import toast from 'react-hot-toast'

const SewaManagement = () => {
  const [fleet, setFleet] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(initialFormData())

  const loadData = async () => {
    setLoading(true)
    const result = await sewaService.fleet.getAll({
      name: searchTerm || undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined
    })
    if (result.success) {
      setFleet(result.data)
    } else {
      toast.error('Gagal memuat data: ' + result.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [searchTerm, filterStatus])

  useEffect(() => {
    const channel = sewaService.fleet.subscribe((payload) => {
      setFleet(prev => {
        switch (payload.eventType) {
          case 'INSERT': return [payload.new, ...prev]
          case 'UPDATE': return prev.map(item => item.id === payload.new.id ? payload.new : item)
          case 'DELETE': return prev.filter(item => item.id !== payload.old.id)
          default: return prev
        }
      })
    })
    return () => channel.unsubscribe()
  }, [])

  const handleAdd = () => {
    setEditingItem(null)
    setFormData(initialFormData())
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      cat: item.cat,
      scale: item.scale,
      speed: item.speed,
      price: item.price,
      status: item.status,
      unitTersisa: item.unitTersisa,
      rating: item.rating
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus unit ini?')) return
    const result = await sewaService.fleet.delete(id)
    if (result.success) {
      toast.success('Unit berhasil dihapus')
    } else {
      toast.error('Gagal menghapus: ' + result.error)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const data = {
      name: formData.name,
      category: formData.cat,
      scale: formData.scale,
      speed: formData.speed,
      price_per_day: formData.price,
      status: formData.status,
      unit_tersisa: formData.unitTersisa,
      rating: formData.rating || 0
    }
    let result
    if (editingItem) {
      result = await sewaService.fleet.update(editingItem.id, data)
    } else {
      result = await sewaService.fleet.create(data)
    }
    setLoading(false)
    if (result.success) {
      toast.success(editingItem ? 'Unit berhasil diupdate' : 'Unit berhasil ditambahkan')
      setShowModal(false)
    } else {
      toast.error('Gagal menyimpan: ' + result.error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="f-display uppercase text-xs font-semibold text-amber">Modul 1</div>
          <h2 className="f-display font-bold text-3xl text-paper">Manajemen Sewa RC</h2>
          <p className="text-steel mt-1">Kelola daftar unit RC yang tersedia untuk disewa</p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus size={18} /> Tambah Unit
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="text"
            placeholder="Cari unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-primary pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-primary w-full sm:w-auto"
        >
          <option value="all">Semua Status</option>
          <option value="tersedia">Tersedia</option>
          <option value="disewa">Disewa</option>
          <option value="servis">Servis</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 rounded-full animate-spin border-4 border-amber border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full">
            <thead className="bg-asphalt/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium uppercase text-steel">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium uppercase text-steel">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium uppercase text-steel">Skala</th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium uppercase text-steel">Harga/Hari</th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium uppercase text-steel">Status</th>
                <th className="px-4 py-3 text-left text-xs font-mono font-medium uppercase text-steel">Unit</th>
                <th className="px-4 py-3 text-right text-xs font-mono font-medium uppercase text-steel">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fleet.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-steel">Belum ada data unit RC</td>
                </tr>
              ) : (
                fleet.map((item) => {
                  const meta = STATUS_META[item.status]
                  return (
                    <tr key={item.id} className="border-t border-line/50 hover:bg-panel/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-paper">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-steel">{item.cat}</td>
                      <td className="px-4 py-3 text-sm text-steel">{item.scale}</td>
                      <td className="px-4 py-3 text-sm f-mono font-bold text-amber">{rupiah(item.price)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs f-display font-bold uppercase bg-asphalt/80" style={{ color: meta.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-steel">{item.unitTersisa}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded hover:bg-amber/10 text-amber transition">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red/10 text-red transition ml-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="f-display uppercase text-xs font-semibold text-amber">
            {editingItem ? 'Edit Unit' : 'Tambah Unit Baru'}
          </div>
          <h3 className="f-display font-bold text-2xl text-paper mt-1">
            {editingItem ? editingItem.name : 'Unit RC'}
          </h3>
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs f-display uppercase font-semibold text-steel mb-2">Nama Unit *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs f-display uppercase font-semibold text-steel mb-2">Kategori *</label>
              <select
                value={formData.cat}
                onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                className="input-primary"
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="Off-Road">Off-Road</option>
                <option value="Drift">Drift</option>
                <option value="Rally">Rally</option>
                <option value="Drone">Drone</option>
                <option value="Crawler">Crawler</option>
                <option value="Mini Racer">Mini Racer</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs f-display uppercase font-semibold text-steel mb-2">Skala</label>
                <input
                  type="text"
                  value={formData.scale}
                  onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                  className="input-primary"
                  placeholder="1:10"
                />
              </div>
              <div>
                <label className="block text-xs f-display uppercase font-semibold text-steel mb-2">Kecepatan</label>
                <input
                  type="text"
                  value={formData.speed}
                  onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                  className="input-primary"
                  placeholder="50 km/j"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs f-display uppercase font-semibold text-steel mb-2">Harga/Hari *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="input-primary"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs f-display uppercase font-semibold text-steel mb-2">Unit Tersisa</label>
                <input
                  type="number"
                  value={formData.unitTersisa}
                  onChange={(e) => setFormData({ ...formData, unitTersisa: parseInt(e.target.value) || 0 })}
                  className="input-primary"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs f-display uppercase font-semibold text-steel mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-primary"
              >
                <option value="tersedia">Tersedia</option>
                <option value="disewa">Disewa</option>
                <option value="servis">Servis</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="flex-1 btn-primary">
                {loading ? 'Menyimpan...' : (editingItem ? 'Update' : 'Tambah')}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function initialFormData() {
  return {
    name: '',
    cat: '',
    scale: '',
    speed: '',
    price: 0,
    status: 'tersedia',
    unitTersisa: 0,
    rating: 0
  }
}

export default SewaManagement