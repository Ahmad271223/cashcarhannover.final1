import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Lock, User, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ADMIN_PATH = "verwaltung-x7k9m2";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, credentials);
      localStorage.setItem("admin_token", response.data.token);
      localStorage.setItem("admin_username", response.data.username);
      toast.success("Erfolgreich angemeldet");
      navigate(`/${ADMIN_PATH}/dashboard`);
    } catch (error) {
      toast.error("Ungültige Anmeldedaten");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Car className="w-7 h-7 text-slate-900" />
            </div>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-white mb-2">
            Admin-Bereich
          </h1>
          <p className="text-slate-400">
            Melden Sie sich an, um Fahrzeuge zu verwalten
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Benutzername</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  data-testid="admin-username-input"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="admin"
                  className="h-12 pl-10 bg-slate-50"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  data-testid="admin-password-input"
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="h-12 pl-10 bg-slate-50"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              data-testid="admin-login-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Anmelden...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Geschützter Admin-Bereich
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Zurück zur Startseite
          </Link>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          Geschützter Bereich
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
