import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import CarSubmissionForm from "@/pages/CarSubmissionForm";
import SuccessPage from "@/pages/SuccessPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminCarDetail from "@/pages/AdminCarDetail";

function App() {
  return (
    <div className="App min-h-screen bg-slate-50">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/verkaufen" element={<CarSubmissionForm />} />
          <Route path="/erfolg" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/cars/:id" element={<AdminCarDetail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
