import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Stack,
  Badge,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("TOKEN:", token);

      if (!token) {
        setError("No token found. Please login again.");
        return;
      }

      const res = await axios.get(
        "http://4.224.186.213/evaluation-service/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API RESPONSE:", res.data);

      const list =
        res.data?.notifications ||
        res.data?.data ||
        res.data ||
        [];

      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>

      <Stack direction="row" spacing={2} alignItems="center">
        <Badge badgeContent={notifications.length} color="primary">
          <NotificationsIcon />
        </Badge>

        <Typography variant="h5">
          Notifications
        </Typography>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {loading && <CircularProgress />}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found</Alert>
      )}

      <Stack spacing={1.5} mt={2}>
        {notifications.map((n, i) => (
          <Box
            key={n.ID || i}
            sx={{
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
            }}
          >
            <Typography fontWeight="bold">
              {n.Type}
            </Typography>

            <Typography>
              {n.Message}
            </Typography>

            <Typography variant="caption">
              {n.Timestamp}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}