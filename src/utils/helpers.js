import { C } from './constants'

export const rupiah = (n) => "Rp " + n.toLocaleString("id-ID")

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getStatusColor = (status) => {
  const colors = {
    active: C.green,
    pending: "#FFB020",
    completed: C.amber,
    cancelled: C.red
  }
  return colors[status] || C.steel
}

export const getStatusBadge = (status) => {
  const badges = {
    tersedia: { label: 'Tersedia', className: 'badge-success' },
    disewa: { label: 'Disewa', className: 'badge-danger' },
    servis: { label: 'Servis', className: 'badge-warning' },
  }
  return badges[status] || { label: status, className: 'badge-info' }
}