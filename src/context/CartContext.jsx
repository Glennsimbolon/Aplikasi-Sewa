import React, { createContext, useState, useContext, useMemo } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.key === item.key)
      if (existing) {
        return prev.map(i => i.key === item.key ? { ...i, qty: i.qty + (item.qty || 1) } : i)
      }
      return [...prev, { ...item, qty: item.qty || 1 }]
    })
    setCartOpen(true)
  }

  const removeFromCart = (key) => {
    setCart(prev => prev.filter(i => i.key !== key))
  }

  const clearCart = () => setCart([])

  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart])
  const totalPrice = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart])

  const value = {
    cart,
    cartOpen,
    setCartOpen,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}