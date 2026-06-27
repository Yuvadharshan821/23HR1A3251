import axios from "axios";

export const fetchNotifications = async (token) => {
  const res = await axios.get("/api/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};