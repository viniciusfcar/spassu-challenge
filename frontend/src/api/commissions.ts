import type { CommissionsResponse } from "../types";
import api from "./client";

export const commissionsApi = {
  get: (startDate: string, endDate: string) =>
    api
      .get<CommissionsResponse>("/commissions/", {
        params: { start_date: startDate, end_date: endDate },
      })
      .then((r) => r.data),
};
