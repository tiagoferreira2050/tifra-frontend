export type OrderStatus =
  | "analysis"
  | "preparing"
  | "delivering"
  | "finished";

export type DeliveryType =
  | "entrega"
  | "retirada"
  | "balcao";

export type Order = {
  id: string;

  deliveryType: DeliveryType;

  customer: string;
  phone?: string;

  address?: string;
  shortAddress?: string;

  total: number;
  createdAt: string;

  status: OrderStatus;

  items?: { name: string; qty: number }[];

  paymentMethod?: string;
  changeFor?: number;

  isNewCustomer?: boolean;
  ordersCount?: number;
};
