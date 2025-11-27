import { Order, OrderStatus } from './orderTypes';

const MOCK_ORDERS: Order[] = [
  {
    id: 'B-2002',
    deliveryType: "entrega", // ou retirada
    customer: 'Erick',
    phone: '(71) 99155-0128',
    address: 'Rua Augusta, 30 - Consolação',
    shortAddress: 'Rua Augusta, 30 • Consolação',
    total: 31.9,
    createdAt: '22/10 às 20:21',
    status: 'analysis',
    items: [{ name: 'Açaí 500ml', qty: 1 }],
    paymentMethod: 'Dinheiro',
    changeFor: 0,
    isNewCustomer: true,
    ordersCount: 1,
  },
  {
    id: 'B-2003',
    customer: 'Victor',
    phone: '(77) 99830-9462',
    address: 'Rua das Laranjeiras, 100 - Centro',
    shortAddress: 'Rua Laranjeiras, 100 • Centro',
    total: 54.9,
    createdAt: '22/10 às 23:38',
    status: 'preparing',
    items: [{ name: 'Açaí 1L', qty: 1 }],
    paymentMethod: 'Cartão',
    isNewCustomer: false,
    ordersCount: 2,
  },
  {
    id: 'B-3418',
    customer: 'Claudia',
    phone: '6799049159',
    address: 'Praça X, 45 - Bairro Y',
    shortAddress: 'Praça X, 45 • Bairro Y',
    total: 94.9,
    createdAt: 'há 14h e 50min',
    status: 'delivering',
    items: [{ name: 'Açaí Love Ninho', qty: 1 }],
    paymentMethod: 'Dinheiro',
    changeFor: 100,
    isNewCustomer: false,
    ordersCount: 5,
  },
];

export function getMockOrders(): Order[] {
  // retorna cópia pra evitar mutação externa
  return JSON.parse(JSON.stringify(MOCK_ORDERS));
}

export function updateStatus(orders: Order[], id: string, to: OrderStatus) {
  return orders.map(o => (o.id === id ? { ...o, status: to } : o));
}