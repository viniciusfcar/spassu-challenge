import { create } from "zustand";
import { salesApi } from "../api/sales";
import type { PaginatedResponse, Sale, SalePayload } from "../types";

interface SalesState {
  page: PaginatedResponse<Sale> | null;
  currentPage: number;
  search: string;
  loading: boolean;
  error: string | null;
  fetchSales: (page?: number, search?: string) => Promise<void>;
  createSale: (payload: SalePayload) => Promise<Sale>;
  updateSale: (id: number, payload: SalePayload) => Promise<Sale>;
  deleteSale: (id: number) => Promise<void>;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  page: null,
  currentPage: 1,
  search: "",
  loading: false,
  error: null,

  fetchSales: async (page = get().currentPage, search = get().search) => {
    set({ loading: true, error: null, currentPage: page, search });
    try {
      const data = await salesApi.list(page, search);
      set({ page: data });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createSale: async (payload) => {
    const sale = await salesApi.create(payload);
    await get().fetchSales(1, "");
    return sale;
  },

  updateSale: async (id, payload) => {
    const sale = await salesApi.update(id, payload);
    await get().fetchSales();
    return sale;
  },

  deleteSale: async (id) => {
    await salesApi.remove(id);
    await get().fetchSales();
  },
}));
