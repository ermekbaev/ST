export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  image: string;
}

export interface DeliveryDetails {
  name: string;
  address: string;
  email: string;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: string;
  items: OrderItem[];
  deliveryDetails: DeliveryDetails;
  deliveryMethod: string;
  paymentMethod: string;
  notes?: string;
  orderTime: string;
  canPay?: boolean;
}