import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import axios from "axios";

const API = "/api/notifications";

export default function AllNotifications() {
  const [data, setData] = useState([]);
  const [type, setType] = useState("All");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      const res = await axios.get(API, {
        params: type === "All" ? {} : { notification_type: type },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data.notifications || []);
    } catch (err) {
      console.log("Error fetching notifications:", err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        All Notifications
      </Typography>

      <Select
        value={type}
        onChange={(e) => setType(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      >
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="Event">Event</MenuItem>
        <MenuItem value="Result">Result</MenuItem>
        <MenuItem value="Placement">Placement</MenuItem>
      </Select>

      <Stack spacing={2}>
        {data.length === 0 ? (
          <Typography color="text.secondary">
            No notifications found
          </Typography>
        ) : (
          data.map((n, index) => (
            <Card key={n.ID || index} variant="outlined">
              <CardContent>
                <Typography variant="h6">
                  {n.Type}
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {n.Message}
                </Typography>

                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  {n.Timestamp}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Container>
  );
}