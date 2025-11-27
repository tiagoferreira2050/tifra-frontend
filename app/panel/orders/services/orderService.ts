// app/panel/orders/services/orderService.ts

/* 🔥 Tipo totalmente opcional — compatível com qualquer pedido mock */
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

/* 🔥 Mock seguro — nenhum dado obrigatório */
export function getMockOrders(): Order[] {
  return [
    {
      id: 'A-1001',
      customer: 'Lucas',
      phone: '(77) 99211-4578',
      address: 'Rua Principal, 220',
      shortAddress: 'Rua Principal, 220',
      total: 24.90,
      createdAt: 'Agora',
      status: 'analysis',
      items: [
        { name: 'Açaí 500ml', qty: 1 }
      ],
      paymentMethod: 'pix',
      isNewCustomer: false,
      ordersCount: 1,
    },
    {
      id: 'B-2003',
      customer: 'Victor',
      phone: '(77) 99830-9462',
      address: 'Av. Brasil, 100',
      shortAddress: 'Av. Brasil, 100',
      total: 39.90,
      createdAt: 'Há 5 min',
      status: 'preparing',
      items: [
        { name: 'Açaí 700ml', qty: 1 },
      ],
      paymentMethod: 'cartão',
      isNewCustomer: false,
      ordersCount: 1,
    }
  ];
}
