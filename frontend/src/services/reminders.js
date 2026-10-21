import api from "./api";

export const getReminders = async (params = {}) => {
  const { data } = await api.get("/reminders", { params });
  return data;
};

export const getReminder = async (id) => {
  const { data } = await api.get(`/reminders/${id}`);
  return data;
};

export const getReminderSummary = async (timezone) => {
  const { data } = await api.get("/reminders/summary", { params: { timezone } });
  return data;
};

export const getReminderNotifications = async () => {
  const { data } = await api.get("/reminders/notifications");
  return data;
};

export const createReminder = async (reminder) => {
  const { data } = await api.post("/reminders", reminder);
  return data;
};

export const updateReminder = async (id, reminder) => {
  const { data } = await api.patch(`/reminders/${id}`, reminder);
  return data;
};

export const updateReminderStatus = async (id, status) => {
  const { data } = await api.patch(`/reminders/${id}/status`, { status });
  return data;
};

export const deleteReminder = async (id) => {
  const { data } = await api.delete(`/reminders/${id}`);
  return data;
};
