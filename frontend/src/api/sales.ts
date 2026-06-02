import type { PaginatedResponse, Sale, SalePayload } from "../types";
import api from "./client";

export const salesApi = {
  list: (page = 1, search = "") =>
    api
      .get<PaginatedResponse<Sale>>("/sales/", { params: { page, search } })
      .then((r) => r.data),

  get: (id: number) => api.get<Sale>(`/sales/${id}/`).then((r) => r.data),

  create: (payload: SalePayload) =>
    api.post<Sale>("/sales/", payload).then((r) => r.data),

  update: (id: number, payload: SalePayload) =>
    api.put<Sale>(`/sales/${id}/`, payload).then((r) => r.data),

  remove: (id: number) => api.delete(`/sales/${id}/`),
};
