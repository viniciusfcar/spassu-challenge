import { create } from "zustand";
import { commissionsApi } from "../api/commissions";
import type { CommissionsResponse } from "../types";

interface CommissionsState {
  startDate: string;
  endDate: string;
  data: CommissionsResponse | null;
  loading: boolean;
  error: string | null;
  setDateRange: (start: string, end: string) => void;
  fetchCommissions: () => Promise<void>;
}

export const useCommissionsStore = create<CommissionsState>((set, get) => ({
  startDate: "",
  endDate: "",
  data: null,
  loading: false,
  error: null,

  setDateRange: (startDate, endDate) => set({ startDate, endDate }),

  fetchCommissions: async () => {
    const { startDate, endDate } = get();
    if (!startDate || !endDate) return;
    set({ loading: true, error: null });
    try {
      const data = await commissionsApi.get(startDate, endDate);
      set({ data });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
