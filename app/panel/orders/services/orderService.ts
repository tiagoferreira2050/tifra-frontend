export type Order = {
  id: string;
  customer: string;
  total: number;
  status: string;

  phone?: string;
  deliveryType?: string;
  address?: string;
  shortAddress?: string;
  createdAt?: string;
  items?: { name: string; qty: number }[];
  paymentMethod?: string;
  deliveryFee?: number;

  isNewCustomer?: boolean;
  ordersCount?: number;
};
