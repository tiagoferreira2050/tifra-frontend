export type OrderStatus = 'analysis' | 'preparing' | 'delivering' | 'finished';

export type Order = {
  id: string;
  deliveryType: "entrega", // ou retirada
  customer: string;
  phone?: string;
  address?: string;
  shortAddress?: string; // rua, nº, bairro (resumida)
  total: number;
  createdAt: string;
  status: OrderStatus;
  items?: { name: string; qty: number }[];
  paymentMethod?: string;
  changeFor?: number; // troco
  isNewCustomer?: boolean;
  ordersCount?: number; // quantas vezes já comprou
};