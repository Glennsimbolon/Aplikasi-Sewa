export const C = {
  asphalt: "#0F1113",
  asphalt2: "#17191C",
  panel: "#1D2023",
  line: "#2B2F33",
  paper: "#F3F1EA",
  amber: "#FF6A13",
  amberDim: "#B94F0F",
  green: "#3CC17A",
  red: "#E8493B",
  steel: "#8A9199",
  steelLight: "#C7CCD1",
}

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  CASHIER: 'kasir',
  TECHNICIAN: 'teknis',
  TENANT: 'tenant',
  CUSTOMER: 'customer'
}

export const MODULES = [
  { id: "sewa", label: "Sewa RC", icon: "Zap", tag: "Booking harian" },
  { id: "store", label: "Toko RC", icon: "ShoppingBag", tag: "Beli unit baru" },
  { id: "reparasi", label: "Reparasi", icon: "Wrench", tag: "Servis & upgrade" },
  { id: "workshop", label: "Workshop", icon: "GraduationCap", tag: "Kelas & edukasi" },
  { id: "kompetisi", label: "Kompetisi", icon: "Trophy", tag: "Lomba & ranking" },
  { id: "foodcourt", label: "Food Court", icon: "UtensilsCrossed", tag: "Sambil nunggu giliran" },
]

export const CATEGORIES = ["Semua", "Off-Road", "Drift", "Rally", "Drone", "Crawler", "Mini Racer"]

export const STATUS_META = {
  tersedia: { label: "Tersedia", color: C.green },
  disewa: { label: "Disewa", color: C.red },
  servis: { label: "Servis", color: "#FFB020" },
}