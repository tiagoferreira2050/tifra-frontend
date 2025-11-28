export type OrderStatus = "analysis" | "preparing" | "delivering" | "finished";

export interface Order {
  id: string;

  customer: string;
  phone?: string;

  deliveryType?: string; // 🔥 era literal, agora é flexível
  address?: string;
  shortAddress?: string;

  createdAt: string; // 🔥 compatível com mock e pedidos novos
  status: OrderStatus;

  total: number;
  items?: any[];

  paymentMethod?: string;
  deliveryFee?: number;

  isNewCustomer?: boolean;
  ordersCount?: number;
}
