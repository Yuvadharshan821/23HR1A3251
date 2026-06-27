const express = require("express");
const axios = require("axios");

const app = express();

const API_URL =
  "http://4.224.186.213/evaluation-service/notifications";

// 🔴 PUT YOUR FULL TOKEN HERE
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ5dXZhZGhhcnNoYW4yMDA1QGdtYWlsLmNvbSIsImV4cCI6MTc4MjU0MzM3NCwiaWF0IjoxNzgyNTQyNDc0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZTg5NTc2ZDctNTk0NC00MGI4LWE1MjgtNTAzOGNmY2E1ZjkzIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoicGF0dGlyaWtpIHl1dmFkaGFyc2hhbiIsInN1YiI6ImQ5NGFkYzVmLWFiZDktNDlkYS1iZDJiLWNhYjI5Y2Q4NjgwMCJ9LCJlbWFpbCI6Inl1dmFkaGFyc2hhbjIwMDVAZ21haWwuY29tIiwibmFtZSI6InBhdHRpcmlraSB5dXZhZGhhcnNoYW4iLCJyb2xsTm8iOiIyM2hyMWEzMjUxIiwiYWNjZXNzQ29kZSI6ImFUa3licyIsImNsaWVudElEIjoiZDk0YWRjNWYtYWJkOS00OWRhLWJkMmItY2FiMjljZDg2ODAwIiwiY2xpZW50U2VjcmV0IjoiV3VucGpId0pQcHN0UWNLRCJ9._-_po32dd9qkWld4UhHO8XWN88l2BTlX3J3DFdi_Zw8";

const weight = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// Score = priority + recency
function getScore(n) {
  const time = new Date(n.Timestamp).getTime();
  return (weight[n.Type] || 0) * 1000000000 + time;
}

// Min Heap (keeps only top 10)
class MinHeap {
  constructor() {
    this.arr = [];
  }

  push(item) {
    this.arr.push(item);
    this.arr.sort((a, b) => a.score - b.score);

    if (this.arr.length > 10) {
      this.arr.shift();
    }
  }

  getTop() {
    return this.arr.sort((a, b) => b.score - a.score);
  }
}

app.get("/top10", async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const data = response.data.notifications;

    const heap = new MinHeap();

    data.forEach((n) => {
      heap.push({
        ...n,
        score: getScore(n),
      });
    });

    res.json({
      top10: heap.getTop(),
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});