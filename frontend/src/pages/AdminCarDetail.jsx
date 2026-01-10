import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Car, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Palette,
  Users,
  FileText,
  Shield,
  Wrench,
  Banknote,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUSES = ["Neu", "In Bearbeitung", "Inseriert", "Verkauft", "Abgelehnt"];
const ADMIN_PATH = "verwaltung-x7k9m2";

const AdminCarDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate(`/${ADMIN_PATH}`);
      return;
    }
    fetchCar();
  }, [id, navigate]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token")}`
  });

  const fetchCar = async () => {
    try {
      const response = await axios.get(`${API}/admin/cars/${id}`, { headers: getAuthHeaders() });
      setCar(response.data);
      setStatus(response.data.status);
      setAdminNotes(response.data.admin_notes || "");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Sitzung abgelaufen");
        navigate(`/${ADMIN_PATH}`);
      } else if (error.response?.status === 404) {
        toast.error("Fahrzeug nicht gefunden");
        navigate(`/${ADMIN_PATH}/dashboard`);
      } else {
        toast.error("Fehler beim Laden");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/cars/${id}`, 
        { status, admin_notes: adminNotes },
        { headers: getAuthHeaders() }
      );
      toast.success("Änderungen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (s) => {
    const colors = {
      "Neu": "bg-blue-500",
      "In Bearbeitung": "bg-yellow-500",
      "Inseriert": "bg-purple-500",
      "Verkauft": "bg-emerald-500",
      "Abgelehnt": "bg-red-500"
    };
    return colors[s] || "bg-slate-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/${ADMIN_PATH}/dashboard`} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden md:inline">Zurück zur Übersicht</span>
            </Link>
            {car && (
              <span className="px-3 py-1 bg-white/10 rounded-lg font-mono text-orange-400 text-sm">
                #{car.id}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
            <span className="font-medium">{status}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-heading font-semibold text-lg">Fotos ({car.photos?.length || 0})</h2>
              </div>
              {car.photos && car.photos.length > 0 ? (
                <div>
                  <div 
                    className="aspect-video relative cursor-pointer"
                    onClick={() => setShowLightbox(true)}
                  >
                    <img 
                      src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${car.photos[selectedPhoto]}`}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedPhoto + 1} / {car.photos.length}
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-6 md:grid-cols-8 gap-2">
                    {car.photos.map((photo, index) => (
                      <div 
                        key={photo}
                        className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          index === selectedPhoto ? 'border-orange-500' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedPhoto(index)}
                      >
                        <img 
                          src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${photo}`}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Car className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Keine Fotos hochgeladen</p>
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-heading font-semibold text-lg">Fahrzeugdaten</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Car className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Fahrzeug</p>
                      <p className="font-semibold">{car.brand} {car.model} {car.variant}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Erstzulassung</p>
                      <p className="font-semibold">{car.first_registration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Gauge className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Kilometerstand</p>
                      <p className="font-semibold">{parseInt(car.mileage).toLocaleString('de-DE')} km</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Fuel className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Kraftstoff</p>
                      <p className="font-semibold">{car.fuel_type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings2 className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Getriebe</p>
                      <p className="font-semibold">{car.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Car className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Fahrzeugtyp</p>
                      <p className="font-semibold">{car.body_type} ({car.doors} Türen)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Palette className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Farbe</p>
                      <p className="font-semibold">{car.color}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Vorbesitzer</p>
                      <p className="font-semibold">{car.previous_owners}</p>
                    </div>
                  </div>
                  {car.power_hp && (
                    <div className="flex items-start gap-3">
                      <Gauge className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Leistung</p>
                        <p className="font-semibold">{car.power_hp} PS</p>
                      </div>
                    </div>
                  )}
                  {car.tuv_until && (
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">TÜV bis</p>
                        <p className="font-semibold">{car.tuv_until}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">FIN</p>
                      <p className="font-mono font-semibold">{car.vin}</p>
                    </div>
                  </div>
                </div>

                {car.description && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-2">Beschreibung</p>
                    <p className="text-slate-700">{car.description}</p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${car.accident_free ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {car.accident_free ? <Shield className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {car.accident_free ? 'Unfallfrei' : 'Mit Unfallschaden'}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${car.service_history ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    <Wrench className="w-4 h-4" />
                    {car.service_history ? 'Scheckheftgepflegt' : 'Ohne Scheckheft'}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            {car.documents && car.documents.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h2 className="font-heading font-semibold text-lg">Dokumente ({car.documents.length})</h2>
                </div>
                <div className="p-4 space-y-2">
                  {car.documents.map((doc) => (
                    <a
                      key={doc}
                      href={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${doc}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-slate-700">{doc}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Preisvorstellung
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-sm text-slate-500 mb-1">Wunschpreis</p>
                  <p className="text-3xl font-bold text-slate-900">{formatPrice(car.pricing.desired_price)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-sm text-slate-500 mb-1">Mindestpreis</p>
                  <p className="text-2xl font-bold text-slate-900">{formatPrice(car.pricing.minimum_price)}</p>
                </div>
                {car.pricing.competitor_price && (
                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Vergleichsangebot</p>
                    <p className="text-xl font-semibold text-slate-900">{formatPrice(car.pricing.competitor_price)}</p>
                    <p className="text-sm text-slate-500 mt-1">{car.pricing.competitor_source}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-heading font-semibold text-lg">Kontakt</h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="font-semibold text-lg">{car.contact.first_name} {car.contact.last_name}</p>
                <a 
                  href={`tel:${car.contact.phone}`}
                  className="flex items-center gap-3 text-slate-600 hover:text-orange-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {car.contact.phone}
                </a>
                <a 
                  href={`mailto:${car.contact.email}`}
                  className="flex items-center gap-3 text-slate-600 hover:text-orange-600 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  {car.contact.email}
                </a>
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="w-5 h-5" />
                  {car.contact.city}
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-heading font-semibold text-lg">Verwaltung</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger data-testid="status-select" className="bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_notes">Interne Notizen</Label>
                  <Textarea
                    data-testid="admin-notes-textarea"
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notizen zum Fahrzeug..."
                    rows={4}
                    className="bg-slate-50"
                  />
                </div>

                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  data-testid="save-btn"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Änderungen speichern
                    </>
                  )}
                </Button>

                <div className="pt-4 border-t border-slate-200 text-sm text-slate-500">
                  <p>Erstellt: {formatDate(car.created_at)}</p>
                  <p>Aktualisiert: {formatDate(car.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {showLightbox && car.photos && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => setShowLightbox(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto((prev) => (prev === 0 ? car.photos.length - 1 : prev - 1));
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto((prev) => (prev === car.photos.length - 1 ? 0 : prev + 1));
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          <img 
            src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${car.photos[selectedPhoto]}`}
            alt={`${car.brand} ${car.model}`}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {selectedPhoto + 1} / {car.photos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCarDetail;
