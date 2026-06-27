export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  categoryName: string
  image: string | null
  available: boolean
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  type: "dine-in" | "takeaway" | "delivery"
  tableId?: string
  customerName?: string
  createdAt: string
}

export type OrderStatus = Order["status"]
export type OrderType = Order["type"]
