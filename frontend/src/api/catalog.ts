import type { Client, PaginatedResponse, Product, Seller } from "../types";
import api from "./client";

export const catalogApi = {
  products: {
    list: () => api.get<PaginatedResponse<Product>>("/products/?page_size=1000").then((r) => r.data.results),
  },
  clients: {
    list: () => api.get<PaginatedResponse<Client>>("/clients/?page_size=1000").then((r) => r.data.results),
  },
  sellers: {
    list: () => api.get<PaginatedResponse<Seller>>("/sellers/?page_size=1000").then((r) => r.data.results),
  },
};
