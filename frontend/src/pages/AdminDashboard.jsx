import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Car, 
  LogOut, 
  Search, 
  Eye,
  Trash2,
  RefreshCw,
  LayoutDashboard,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Settings,
  Lock
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUSES = ["Alle", "Neu", "In Bearbeitung", "Inseriert", "Verkauft", "Abgelehnt"];
const ADMIN_PATH = "verwaltung-x7k9m2";

const getStatusBadge = (status) => {
  const styles = {
    "Neu": "status-neu",
    "In Bearbeitung": "status-bearbeitung",
    "Inseriert": "status-inseriert",
    "Verkauft": "status-verkauft",
    "Abgelehnt": "status-abgelehnt"
  };
  return `status-badge ${styles[status] || "bg-slate-100 text-slate-600"}`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, in_progress: 0, listed: 0, sold: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Alle");
  const [search, setSearch] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate(`/${ADMIN_PATH}`);
      return;
    }
    fetchData();
  }, [navigate, filter, search]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token")}`
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [carsRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/cars`, {
          headers: getAuthHeaders(),
          params: { status: filter, search: search || undefined }
        }),
        axios.get(`${API}/admin/stats`, { headers: getAuthHeaders() })
      ]);
      setCars(carsRes.data.cars);
      setStats(statsRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Sitzung abgelaufen");
        localStorage.removeItem("admin_token");
        navigate(`/${ADMIN_PATH}`);
      } else {
        toast.error("Fehler beim Laden der Daten");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    navigate(`/${ADMIN_PATH}`);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen haben");
      return;
    }

    setChangingPassword(true);
    try {
      await axios.post(`${API}/admin/change-password`, {
        current_password: passwordData.current,
        new_password: passwordData.new
      }, { headers: getAuthHeaders() });
      
      toast.success("Passwort erfolgreich geändert");
      setShowPasswordDialog(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Fehler beim Ändern des Passworts");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDelete = async (carId, e) => {
    e.stopPropagation();
    if (!window.confirm("Fahrzeug wirklich löschen?")) return;

    try {
      await axios.delete(`${API}/admin/cars/${carId}`, { headers: getAuthHeaders() });
      toast.success("Fahrzeug gelöscht");
      fetchData();
    } catch (error) {
      toast.error("Fehler beim Löschen");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-slate-900" />
              </div>
              <span className="font-heading font-bold text-xl hidden md:inline">AutoVerkauf Pro</span>
            </Link>
            <span className="text-slate-400">|</span>
            <span className="flex items-center gap-2 text-sm">
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                  data-testid="settings-btn"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Einstellungen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Passwort ändern
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">Aktuelles Passwort</Label>
                    <Input
                      id="current"
                      type="password"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData(p => ({ ...p, current: e.target.value }))}
                      data-testid="current-password-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">Neues Passwort</Label>
                    <Input
                      id="new"
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData(p => ({ ...p, new: e.target.value }))}
                      data-testid="new-password-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Passwort bestätigen</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                      data-testid="confirm-password-input"
                    />
                  </div>
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={changingPassword}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    data-testid="change-password-btn"
                  >
                    {changingPassword ? "Wird geändert..." : "Passwort ändern"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500">Gesamt</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.new}</p>
                <p className="text-xs text-slate-500">Neu</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.in_progress}</p>
                <p className="text-xs text-slate-500">In Bearbeitung</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.listed}</p>
                <p className="text-xs text-slate-500">Inseriert</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.sold}</p>
                <p className="text-xs text-slate-500">Verkauft</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                data-testid="search-input"
                placeholder="Suche nach ID, Marke, Modell, FIN, Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-slate-50"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger data-testid="status-filter" className="w-full md:w-48 h-10 bg-slate-50">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchData} className="h-10" data-testid="refresh-btn">
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>
          </div>
        </div>

        {/* Cars Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Laden...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="p-12 text-center">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Keine Fahrzeuge gefunden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fahrzeug</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kunde</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preis</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Datum</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cars.map((car) => (
                    <tr 
                      key={car.id} 
                      className="table-row-hover"
                      onClick={() => navigate(`/${ADMIN_PATH}/cars/${car.id}`)}
                      data-testid={`car-row-${car.id}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {car.photos && car.photos.length > 0 ? (
                            <img 
                              src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${car.photos[0]}`}
                              alt={`${car.brand} ${car.model}`}
                              className="w-16 h-12 object-cover rounded-lg bg-slate-100"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Car className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">{car.brand} {car.model}</p>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded">
                                #{car.id}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500">
                              {car.first_registration} · {parseInt(car.mileage).toLocaleString('de-DE')} km
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{car.contact.first_name} {car.contact.last_name}</p>
                        <p className="text-sm text-slate-500">{car.contact.city}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{formatPrice(car.pricing.desired_price)}</p>
                        <p className="text-sm text-slate-500">Min: {formatPrice(car.pricing.minimum_price)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(car.status)}>{car.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(car.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/${ADMIN_PATH}/cars/${car.id}`);
                            }}
                            data-testid={`view-btn-${car.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => handleDelete(car.id, e)}
                            data-testid={`delete-btn-${car.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
