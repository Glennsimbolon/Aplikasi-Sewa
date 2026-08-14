import React from 'react'
import { X } from 'lucide-react'
import { C } from '../../utils/constants'

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-lg border p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: C.asphalt2, borderColor: C.line }}
      >
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: C.steel }}>
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal