import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
  Lock,
  Plus,
  Package,
  FileText,
  Edit,
  ExternalLink,
  Save,
  Loader2
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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'requests';

  // Requests state
  const [cars, setCars] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, in_progress: 0, listed: 0, sold: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Alle");
  const [search, setSearch] = useState("");

  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({ total: 0, published: 0, sold: 0, reserved: 0, drafts: 0 });
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all");

  // Settings state
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [settings, setSettings] = useState({
    default_contact_name: "",
    default_contact_phone: "",
    default_contact_email: "",
    default_contact_address: "",
    default_contact_city: "",
    default_contact_zip: ""
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Password dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate(`/${ADMIN_PATH}`);
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'requests') {
      fetchRequestsData();
    } else if (activeTab === 'inventory') {
      fetchInventoryData();
    }

    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab, filter, search, inventoryFilter, inventorySearch]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token")}`
  });

  const fetchRequestsData = async () => {
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

  const fetchInventoryData = async () => {
    setInventoryLoading(true);
    try {
      const params = {};
      if (inventorySearch) params.search = inventorySearch;
      if (inventoryFilter === 'published') params.is_published = true;
      if (inventoryFilter === 'sold') params.is_sold = true;
      if (inventoryFilter === 'drafts') params.is_published = false;

      const [inventoryRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/inventory`, {
          headers: getAuthHeaders(),
          params
        }),
        axios.get(`${API}/admin/inventory-stats`, { headers: getAuthHeaders() })
      ]);
      setInventory(inventoryRes.data.vehicles);
      setInventoryStats(statsRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Sitzung abgelaufen");
        localStorage.removeItem("admin_token");
        navigate(`/${ADMIN_PATH}`);
      } else {
        toast.error("Fehler beim Laden des Bestands");
      }
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/admin/settings`, { headers: getAuthHeaders() });
      setSettings(res.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await axios.put(`${API}/admin/settings`, settings, { headers: getAuthHeaders() });
      toast.success("Einstellungen gespeichert");
      setShowSettingsDialog(false);
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSavingSettings(false);
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

  const handleDeleteCar = async (carId, e) => {
    e.stopPropagation();
    if (!window.confirm("Fahrzeug wirklich löschen?")) return;

    try {
      await axios.delete(`${API}/admin/cars/${carId}`, { headers: getAuthHeaders() });
      toast.success("Fahrzeug gelöscht");
      fetchRequestsData();
    } catch (error) {
      toast.error("Fehler beim Löschen");
    }
  };

  const handleDeleteInventory = async (vehicleId, e) => {
    e.stopPropagation();
    if (!window.confirm("Inserat wirklich löschen?")) return;

    try {
      await axios.delete(`${API}/admin/inventory/${vehicleId}`, { headers: getAuthHeaders() });
      toast.success("Inserat gelöscht");
      fetchInventoryData();
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

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-slate-900" />
              </div>
              <span className="font-heading font-bold text-xl hidden md:inline">CashCar</span>
            </Link>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="flex items-center gap-2 text-sm hidden sm:flex">
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Settings Dialog */}
            <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Einstellungen</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Standard-Kontaktdaten
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-slate-500">
                    Diese Daten werden als Standard für neue Inserate verwendet.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="contact_name">Name / Firma</Label>
                      <Input
                        id="contact_name"
                        value={settings.default_contact_name || ""}
                        onChange={(e) => setSettings(s => ({ ...s, default_contact_name: e.target.value }))}
                        placeholder="z.B. CashCar GmbH"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_phone">Telefon</Label>
                      <Input
                        id="contact_phone"
                        value={settings.default_contact_phone || ""}
                        onChange={(e) => setSettings(s => ({ ...s, default_contact_phone: e.target.value }))}
                        placeholder="z.B. +49 123 4567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_email">E-Mail</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={settings.default_contact_email || ""}
                        onChange={(e) => setSettings(s => ({ ...s, default_contact_email: e.target.value }))}
                        placeholder="z.B. info@cashcar.de"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="contact_address">Adresse</Label>
                      <Input
                        id="contact_address"
                        value={settings.default_contact_address || ""}
                        onChange={(e) => setSettings(s => ({ ...s, default_contact_address: e.target.value }))}
                        placeholder="z.B. Musterstraße 123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_zip">PLZ</Label>
                      <Input
                        id="contact_zip"
                        value={settings.default_contact_zip || ""}
                        onChange={(e) => setSettings(s => ({ ...s, default_contact_zip: e.target.value }))}
                        placeholder="z.B. 12345"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_city">Stadt</Label>
                      <Input
                        id="contact_city"
                        value={settings.default_contact_city || ""}
                        onChange={(e) => setSettings(s => ({ ...s, default_contact_city: e.target.value }))}
                        placeholder="z.B. Berlin"
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordDialog(true)}
                    className="w-full"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Passwort ändern
                  </Button>

                  <Button
                    onClick={saveSettings}
                    disabled={savingSettings}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Einstellungen speichern
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">Neues Passwort</Label>
                    <Input
                      id="new"
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData(p => ({ ...p, new: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Passwort bestätigen</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                    />
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={changingPassword}
                    className="w-full bg-orange-500 hover:bg-orange-600"
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
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Abmelden</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1">
            <button
              onClick={() => setTab('requests')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'requests'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              Kundenanfragen
            </button>
            <button
              onClick={() => setTab('inventory')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'inventory'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <Package className="w-4 h-4 inline-block mr-2" />
              Fahrzeugbestand
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ====== REQUESTS TAB ====== */}
        {activeTab === 'requests' && (
          <>
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
                    placeholder="Suche nach ID, Marke, Modell, FIN, Name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10 bg-slate-50"
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full md:w-48 h-10 bg-slate-50">
                    <SelectValue placeholder="Status filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchRequestsData} className="h-10">
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
                  <p className="text-slate-500">Keine Anfragen gefunden</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fahrzeug</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Kunde</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preis</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Datum</th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cars.map((car) => (
                        <tr
                          key={car.id}
                          className="table-row-hover cursor-pointer"
                          onClick={() => navigate(`/${ADMIN_PATH}/cars/${car.id}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {car.photos && car.photos.length > 0 ? (
                                <img
                                  src={
                                    car.photos[0].startsWith('http')
                                      ? car.photos[0]
                                      : car.photos[0].startsWith('cashcar_uploads/')
                                        ? `https://res.cloudinary.com/dktiuq3jr/image/upload/${car.photos[0]}`
                                        : `${process.env.REACT_APP_BACKEND_URL}/api/uploads/${car.photos[0]}`
                                  }
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
                          <td className="px-6 py-4 hidden md:table-cell">
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
                          <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">
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
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => handleDeleteCar(car.id, e)}
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
          </>
        )}

        {/* ====== INVENTORY TAB ====== */}
        {activeTab === 'inventory' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{inventoryStats.total}</p>
                    <p className="text-xs text-slate-500">Gesamt</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{inventoryStats.published}</p>
                    <p className="text-xs text-slate-500">Online</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{inventoryStats.reserved}</p>
                    <p className="text-xs text-slate-500">Reserviert</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{inventoryStats.sold}</p>
                    <p className="text-xs text-slate-500">Verkauft</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{inventoryStats.drafts}</p>
                    <p className="text-xs text-slate-500">Entwürfe</p>
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
                    placeholder="Suche nach ID, Marke, Modell..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="pl-10 h-10 bg-slate-50"
                  />
                </div>
                <Select value={inventoryFilter} onValueChange={setInventoryFilter}>
                  <SelectTrigger className="w-full md:w-48 h-10 bg-slate-50">
                    <SelectValue placeholder="Status filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="published">Online</SelectItem>
                    <SelectItem value="sold">Verkauft</SelectItem>
                    <SelectItem value="drafts">Entwürfe</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchInventoryData} className="h-10">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Aktualisieren
                </Button>
                <Link to={`/${ADMIN_PATH}/inventory/new`}>
                  <Button className="h-10 bg-orange-500 hover:bg-orange-600 w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Neues Inserat
                  </Button>
                </Link>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {inventoryLoading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500">Laden...</p>
                </div>
              ) : inventory.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">Noch keine Inserate vorhanden</p>
                  <Link to={`/${ADMIN_PATH}/inventory/new`}>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Erstes Inserat erstellen
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fahrzeug</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preis</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Erstellt</th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventory.map((vehicle) => (
                        <tr
                          key={vehicle.id}
                          className="table-row-hover cursor-pointer"
                          onClick={() => navigate(`/${ADMIN_PATH}/inventory/${vehicle.id}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {vehicle.photos && vehicle.photos.length > 0 ? (
                                <img
                                  src={vehicle.photos[0].startsWith('http') ? vehicle.photos[0] : `${process.env.REACT_APP_BACKEND_URL}/api/uploads/${vehicle.photos[0]}`}
                                  alt={`${vehicle.brand} ${vehicle.model}`}
                                  className="w-16 h-12 object-cover rounded-lg bg-slate-100"
                                />
                              ) : (
                                <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <Car className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-slate-900">
                                    {vehicle.title || `${vehicle.brand} ${vehicle.model}`}
                                  </p>
                                  {vehicle.featured && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded">
                                      Top
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500">
                                  #{vehicle.id} · {vehicle.first_registration} · {parseInt(vehicle.mileage).toLocaleString('de-DE')} km
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{formatPrice(vehicle.price)}</p>
                            {vehicle.price_negotiable && (
                              <p className="text-xs text-slate-500">VB</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {vehicle.is_sold ? (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                  Verkauft
                                </span>
                              ) : vehicle.is_reserved ? (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                  Reserviert
                                </span>
                              ) : vehicle.is_published ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  Online
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                  Entwurf
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">
                            {formatDate(vehicle.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/bestand/${vehicle.id}`, '_blank');
                                }}
                                title="Im Shop ansehen"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/${ADMIN_PATH}/inventory/${vehicle.id}`);
                                }}
                                title="Bearbeiten"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => handleDeleteInventory(vehicle.id, e)}
                                title="Löschen"
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
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
