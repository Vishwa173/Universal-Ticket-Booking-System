import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./pages/UserDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SelectRole from "./pages/SelectRole";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import TicketSummary from './pages/TicketSummary';
import VerifyCode from './pages/VerifyCode';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select-role" element={<SelectRole />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/vendor" element={<VendorDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/book/:eventId" element={<SeatSelectionPage />} />
        <Route path="/ticket-summary" element={<TicketSummary />} />
        <Route path="/verify-code" element={<VerifyCode />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
