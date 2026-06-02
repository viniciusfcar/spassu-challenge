export interface Product {
  id: number;
  code: string;
  description: string;
  unit_price: string;
  commission_percent: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Seller {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface SaleItem {
  id?: number;
  product: number;
  product_detail?: Product;
  quantity: number;
}

export interface Sale {
  id: number;
  invoice_number: string;
  datetime: string;
  client: number;
  client_detail?: Client;
  seller: number;
  seller_detail?: Seller;
  items: SaleItem[];
  total_value?: string;
}

export interface SalePayload {
  invoice_number: string;
  datetime: string;
  client: number;
  seller: number;
  items: { product: number; quantity: number }[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SellerCommission {
  seller: Seller;
  total_commission: string;
}

export interface CommissionsResponse {
  results: SellerCommission[];
  grand_total: string;
}
