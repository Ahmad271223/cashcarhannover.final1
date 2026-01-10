import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import CookieBanner from "@/components/CookieBanner";
import LandingPage from "@/pages/LandingPage";
import CarSubmissionForm from "@/pages/CarSubmissionForm";
import SuccessPage from "@/pages/SuccessPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminCarDetail from "@/pages/AdminCarDetail";
import Impressum from "@/pages/Impressum";
import Datenschutz from "@/pages/Datenschutz";
import AGB from "@/pages/AGB";
import NotFound from "@/pages/NotFound";

// Secret admin path - change this to your own secret!
const ADMIN_PATH = "verwaltung-x7k9m2";

function App() {
  return (
    <div className="App min-h-screen bg-slate-50">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/verkaufen" element={<CarSubmissionForm />} />
          <Route path="/erfolg" element={<SuccessPage />} />
          <Route path={`/${ADMIN_PATH}`} element={<AdminLogin />} />
          <Route path={`/${ADMIN_PATH}/dashboard`} element={<AdminDashboard />} />
          <Route path={`/${ADMIN_PATH}/cars/:id`} element={<AdminCarDetail />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />
          {/* Redirect old /admin to 404 */}
          <Route path="/admin/*" element={<NotFound />} />
        </Routes>
        <CookieBanner />
      </BrowserRouter>
    </div>
  );
}

export default App;
