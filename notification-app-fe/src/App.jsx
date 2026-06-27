import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllNotifications from "./pages/AllNotifications";
import PriorityNotifications from "./pages/PriorityNotifications";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AllNotifications />} />
        <Route path="/priority" element={<PriorityNotifications />} />
      </Routes>
    </BrowserRouter>
  );
}