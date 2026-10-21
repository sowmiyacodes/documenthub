
import api from "./api";

export const getSettings = async () => {
  const { data } = await api.get("/settings");
  return data;
};

export const updateSettings = async (settings) => {
  const { data } = await api.patch("/settings", settings);
  return data;
};
