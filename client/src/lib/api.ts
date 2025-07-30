import { queryClient } from "./queryClient";

export const API_BASE = "/api";

export const invalidateQueries = (queryKey: string[]) => {
  queryClient.invalidateQueries({ queryKey });
};

export const setQueryData = (queryKey: string[], data: any) => {
  queryClient.setQueryData(queryKey, data);
};
