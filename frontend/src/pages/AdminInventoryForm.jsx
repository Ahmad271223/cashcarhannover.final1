import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  Car, ArrowLeft, Save, Trash2, Eye, Upload, X, Plus,
  Image as ImageIcon, Loader2, Check, AlertCircle, GripVertical
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const ADMIN_PATH = "verwaltung-x7k9m2";

// Equipment features like mobile.de
const EQUIPMENT_CATEGORIES = {
  "Komfort": [
    "Klimaanlage", "Klimaautomatik", "Sitzheizung", "Lenkradheizung", 
    "Standheizung", "Elektrische Fensterheber", "Elektrische Seitenspiegel",
    "Zentralverriegelung", "Keyless Entry", "Keyless Go", "Start-Stop-Automatik",
    "Multifunktionslenkrad", "Tempomat", "Adaptiver Tempomat", "Lordosenstütze"
  ],
  "Infotainment": [
    "Radio", "CD-Player", "USB-Anschluss", "Bluetooth", "Freisprecheinrichtung",
    "Navigationssystem", "Apple CarPlay", "Android Auto", "Soundsystem",
    "Touchscreen", "Head-Up-Display", "DAB-Radio", "WLAN-Hotspot"
  ],
  "Sicherheit": [
    "ABS", "ESP", "Airbag Fahrer", "Airbag Beifahrer", "Seitenairbags",
    "Kopfairbags", "Isofix", "Notbremsassistent", "Spurhalteassistent",
    "Totwinkel-Assistent", "Verkehrszeichenerkennung", "Müdigkeitserkennung",
    "Reifendruckkontrolle", "Berganfahrassistent", "Nebelscheinwerfer"
  ],
  "Exterieur": [
    "LED-Scheinwerfer", "Xenon-Scheinwerfer", "Tagfahrlicht", 
    "Kurvenlicht", "Anhängerkupplung", "Dachgepäckträger", "Schiebedach",
    "Panoramadach", "Sportfahrwerk", "Leichtmetallfelgen", "Dachreling"
  ],
  "Assistenzsysteme": [
    "Einparkhilfe vorne", "Einparkhilfe hinten", "Rückfahrkamera",
    "360°-Kamera", "Parkassistent", "Abstandstempomat", "Spurwechselassistent",
    "Fernlichtassistent", "Regensensor", "Lichtsensor"
  ],
  "Interieur": [
    "Lederlenkrad", "Ledersitze", "Teilleder", "Alcantara", "Stoffsitze",
    "Sportsitze", "Elektrische Sitze", "Sitzmassage", "Ambientebeleuchtung",
    "Mittelarmlehne", "Getränkehalter", "Nichtraucherpaket"
  ]
};

const FUEL_TYPES = ["Benzin", "Diesel", "Elektro", "Hybrid (Benzin)", "Hybrid (Diesel)", "Plug-in-Hybrid", "Erdgas (CNG)", "Autogas (LPG)", "Wasserstoff"];
const TRANSMISSIONS = ["Schaltgetriebe", "Automatik", "Halbautomatik"];
const BODY_TYPES = ["Limousine", "Kombi", "SUV/Geländewagen", "Cabrio", "Coupé", "Van/Kleinbus", "Sportwagen", "Pickup", "Sonstige"];
const DOOR_OPTIONS = ["2/3", "4/5", "6/7"];
const COLORS = ["Schwarz", "Weiß", "Silber", "Grau", "Blau", "Rot", "Grün", "Braun", "Beige", "Orange", "Gelb", "Gold", "Violett", "Sonstige"];
const INTERIOR_MATERIALS = ["Stoff", "Teilleder", "Leder", "Alcantara", "Velours", "Sonstige"];
const EMISSION_CLASSES = ["Euro 1", "Euro 2", "Euro 3", "Euro 4", "Euro 5", "Euro 6", "Euro 6c", "Euro 6d", "Euro 6d-TEMP"];
const ENVIRONMENTAL_BADGES = ["Keine", "Rot (2)", "Gelb (3)", "Grün (4)"];
const ENERGY_EFFICIENCY = ["A+++", "A++", "A+", "A", "B", "C", "D", "E", "F", "G"];
const DRIVE_TYPES = ["Frontantrieb", "Heckantrieb", "Allradantrieb"];

const BRANDS = [
  "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Opel", "Ford",
  "Skoda", "Seat", "Cupra", "Renault", "Peugeot", "Citroën", "Fiat",
  "Toyota", "Honda", "Mazda", "Nissan", "Hyundai", "Kia",
  "Volvo", "Porsche", "Mini", "Jaguar", "Land Rover", "Jeep",
  "Tesla", "Dacia", "Suzuki", "Mitsubishi", "Subaru", "Lexus",
  "Alfa Romeo", "Chevrolet", "Chrysler", "Dodge", "Smart", "Andere"
].sort();

const AdminInventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    variant: "",
    title: "",
    first_registration: "",
    mileage: "",
    fuel_type: "",
    transmission: "",
    power_hp: "",
    power_kw: "",
    engine_size: "",
    cylinders: "",
    drive_type: "",
    body_type: "",
    doors: "",
    seats: "",
    exterior_color: "",
    interior_color: "",
    interior_material: "",
    tuv_until: "",
    hu_au: "",
    accident_free: true,
    service_history: false,
    previous_owners: "",
    non_smoker: false,
    garage_kept: false,
    emission_class: "",
    environmental_badge: "",
    co2_emission: "",
    fuel_consumption_combined: "",
    fuel_consumption_city: "",
    fuel_consumption_highway: "",
    energy_efficiency: "",
    features: [],
    photos: [],
    video_url: "",
    price: "",
    price_negotiable: false,
    vat_deductible: false,
    description: "",
    highlights: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    contact_address: "",
    contact_city: "",
    contact_zip: "",
    is_published: true,
    is_sold: false,
    is_reserved: false,
    featured: false
  });

  const getToken = () => localStorage.getItem('adminToken');

  // Fetch settings for default contact info
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/settings`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Fetch vehicle data in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchVehicle = async () => {
        try {
          const response = await fetch(`${API_URL}/api/admin/inventory/${id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
          });
          if (!response.ok) throw new Error('Vehicle not found');
          const data = await response.json();
          
          setFormData({
            ...data,
            mileage: data.mileage?.toString() || "",
            power_hp: data.power_hp?.toString() || "",
            power_kw: data.power_kw?.toString() || "",
            engine_size: data.engine_size?.toString() || "",
            cylinders: data.cylinders?.toString() || "",
            seats: data.seats?.toString() || "",
            previous_owners: data.previous_owners?.toString() || "",
            co2_emission: data.co2_emission?.toString() || "",
            fuel_consumption_combined: data.fuel_consumption_combined?.toString() || "",
            fuel_consumption_city: data.fuel_consumption_city?.toString() || "",
            fuel_consumption_highway: data.fuel_consumption_highway?.toString() || "",
            price: data.price?.toString() || "",
            photos: data.photos || [],
            features: data.features || []
          });
        } catch (error) {
          toast.error('Fahrzeug konnte nicht geladen werden');
          navigate(`/${ADMIN_PATH}/dashboard`);
        } finally {
          setLoading(false);
        }
      };
      fetchVehicle();
    }
  }, [id, isEditMode, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-calculate KW from HP
    if (name === 'power_hp' && value) {
      const kw = Math.round(parseInt(value) * 0.7355);
      setFormData(prev => ({ ...prev, power_kw: kw.toString() }));
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.photos.length + files.length > 40) {
      toast.error('Maximal 40 Bilder erlaubt');
      return;
    }

    setUploading(true);
    const newPhotos = [];

    for (const file of files) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: formDataUpload
        });

        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        newPhotos.push(data.filename);
      } catch (error) {
        toast.error(`Fehler beim Hochladen von ${file.name}`);
      }
    }

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
    setUploading(false);
    
    if (newPhotos.length > 0) {
      toast.success(`${newPhotos.length} Bild(er) hochgeladen`);
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const movePhoto = (fromIndex, toIndex) => {
    const newPhotos = [...formData.photos];
    const [movedPhoto] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedPhoto);
    setFormData(prev => ({ ...prev, photos: newPhotos }));
  };

  const useDefaultContact = () => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        contact_name: settings.default_contact_name || prev.contact_name,
        contact_phone: settings.default_contact_phone || prev.contact_phone,
        contact_email: settings.default_contact_email || prev.contact_email,
        contact_address: settings.default_contact_address || prev.contact_address,
        contact_city: settings.default_contact_city || prev.contact_city,
        contact_zip: settings.default_contact_zip || prev.contact_zip
      }));
      toast.success('Standard-Kontaktdaten übernommen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.brand || !formData.model || !formData.price) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        ...formData,
        mileage: parseInt(formData.mileage) || 0,
        power_hp: formData.power_hp ? parseInt(formData.power_hp) : null,
        power_kw: formData.power_kw ? parseInt(formData.power_kw) : null,
        engine_size: formData.engine_size ? parseInt(formData.engine_size) : null,
        cylinders: formData.cylinders ? parseInt(formData.cylinders) : null,
        seats: formData.seats ? parseInt(formData.seats) : null,
        previous_owners: formData.previous_owners ? parseInt(formData.previous_owners) : null,
        co2_emission: formData.co2_emission ? parseInt(formData.co2_emission) : null,
        fuel_consumption_combined: formData.fuel_consumption_combined ? parseFloat(formData.fuel_consumption_combined) : null,
        fuel_consumption_city: formData.fuel_consumption_city ? parseFloat(formData.fuel_consumption_city) : null,
        fuel_consumption_highway: formData.fuel_consumption_highway ? parseFloat(formData.fuel_consumption_highway) : null,
        price: parseFloat(formData.price) || 0
      };

      const url = isEditMode 
        ? `${API_URL}/api/admin/inventory/${id}`
        : `${API_URL}/api/admin/inventory`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) throw new Error('Save failed');

      const result = await response.json();
      toast.success(isEditMode ? 'Fahrzeug aktualisiert' : 'Fahrzeug erstellt');
      navigate(`/${ADMIN_PATH}/dashboard?tab=inventory`);
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Möchten Sie dieses Fahrzeug wirklich löschen?')) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (!response.ok) throw new Error('Delete failed');

      toast.success('Fahrzeug gelöscht');
      navigate(`/${ADMIN_PATH}/dashboard?tab=inventory`);
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to={`/${ADMIN_PATH}/dashboard?tab=inventory`}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-heading font-bold text-xl text-slate-900">
                  {isEditMode ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug'}
                </h1>
                {isEditMode && (
                  <p className="text-sm text-slate-500">ID: {id}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isEditMode && (
                <>
                  <Link
                    to={`/bestand/${id}`}
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Vorschau</span>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Löschen</span>
                  </button>
                </>
              )}
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Speichern
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photos Section */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange-500" />
              Fotos (max. 40)
            </h2>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={`${API_URL}/api/uploads/${photo}`}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => movePhoto(index, index - 1)}
                        className="p-1.5 bg-white rounded-full text-slate-700 hover:bg-slate-100"
                      >
                        ←
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index < formData.photos.length - 1 && (
                      <button
                        type="button"
                        onClick={() => movePhoto(index, index + 1)}
                        className="p-1.5 bg-white rounded-full text-slate-700 hover:bg-slate-100"
                      >
                        →
                      </button>
                    )}
                  </div>
                  {index === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded">
                      Hauptbild
                    </span>
                  )}
                </div>
              ))}
              
              {formData.photos.length < 40 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-orange-500 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-slate-400" />
                      <span className="text-xs text-slate-400 mt-1">Hinzufügen</span>
                    </>
                  )}
                </label>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-3">
              {formData.photos.length}/40 Bilder • Das erste Bild wird als Hauptbild verwendet
            </p>
          </section>

          {/* Basic Info */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Grunddaten</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marke *</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Auswählen</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modell *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. A4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Variante</label>
                <input
                  type="text"
                  name="variant"
                  value={formData.variant}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 2.0 TDI S-Line"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Anzeigentitel</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Optional: Eigener Titel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Erstzulassung *</label>
                <input
                  type="text"
                  name="first_registration"
                  value={formData.first_registration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="MM/YYYY"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kilometerstand *</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 85000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preis (€) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 25000"
                  required
                />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="price_negotiable"
                    checked={formData.price_negotiable}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-500 rounded"
                  />
                  <span className="text-sm text-slate-700">VB</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="vat_deductible"
                    checked={formData.vat_deductible}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-500 rounded"
                  />
                  <span className="text-sm text-slate-700">MwSt. ausweisbar</span>
                </label>
              </div>
            </div>
          </section>

          {/* Technical Data */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Technische Daten</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kraftstoff *</label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Auswählen</option>
                  {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Getriebe *</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Auswählen</option>
                  {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leistung (PS)</label>
                <input
                  type="number"
                  name="power_hp"
                  value={formData.power_hp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leistung (kW)</label>
                <input
                  type="number"
                  name="power_kw"
                  value={formData.power_kw}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Wird automatisch berechnet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hubraum (ccm)</label>
                <input
                  type="number"
                  name="engine_size"
                  value={formData.engine_size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 1998"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zylinder</label>
                <input
                  type="number"
                  name="cylinders"
                  value={formData.cylinders}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Antrieb</label>
                <select
                  name="drive_type"
                  value={formData.drive_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Auswählen</option>
                  {DRIVE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fahrzeugtyp *</label>
                <select
                  name="body_type"
                  value={formData.body_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Auswählen</option>
                  {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Türen *</label>
                <select
                  name="doors"
                  value={formData.doors}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Auswählen</option>
                  {DOOR_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sitzplätze</label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 5"
                />
              </div>
            </div>
          </section>

          {/* Colors & Interior */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Farbe & Interieur</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Außenfarbe *</label>
                <select
                  name="exterior_color"
                  value={formData.exterior_color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Auswählen</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Innenfarbe</label>
                <select
                  name="interior_color"
                  value={formData.interior_color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Auswählen</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Innenausstattung</label>
                <select
                  name="interior_material"
                  value={formData.interior_material}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Auswählen</option>
                  {INTERIOR_MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Condition & History */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Zustand & Historie</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">HU/TÜV bis</label>
                <input
                  type="text"
                  name="tuv_until"
                  value={formData.tuv_until}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="MM/YYYY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vorbesitzer</label>
                <input
                  type="number"
                  name="previous_owners"
                  value={formData.previous_owners}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 2"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="accident_free"
                  checked={formData.accident_free}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="text-slate-700">Unfallfrei</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="service_history"
                  checked={formData.service_history}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="text-slate-700">Scheckheftgepflegt</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="non_smoker"
                  checked={formData.non_smoker}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="text-slate-700">Nichtraucherfahrzeug</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="garage_kept"
                  checked={formData.garage_kept}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="text-slate-700">Garagenfahrzeug</span>
              </label>
            </div>
          </section>

          {/* Environmental */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Umwelt & Verbrauch</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Schadstoffklasse</label>
                <select
                  name="emission_class"
                  value={formData.emission_class}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Auswählen</option>
                  {EMISSION_CLASSES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Umweltplakette</label>
                <select
                  name="environmental_badge"
                  value={formData.environmental_badge}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Auswählen</option>
                  {ENVIRONMENTAL_BADGES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CO₂-Emission (g/km)</label>
                <input
                  type="number"
                  name="co2_emission"
                  value={formData.co2_emission}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Energieeffizienz</label>
                <select
                  name="energy_efficiency"
                  value={formData.energy_efficiency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Auswählen</option>
                  {ENERGY_EFFICIENCY.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Verbrauch komb. (l/100km)</label>
                <input
                  type="number"
                  step="0.1"
                  name="fuel_consumption_combined"
                  value={formData.fuel_consumption_combined}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 5.8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Verbrauch innerorts</label>
                <input
                  type="number"
                  step="0.1"
                  name="fuel_consumption_city"
                  value={formData.fuel_consumption_city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 7.2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Verbrauch außerorts</label>
                <input
                  type="number"
                  step="0.1"
                  name="fuel_consumption_highway"
                  value={formData.fuel_consumption_highway}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 4.8"
                />
              </div>
            </div>
          </section>

          {/* Equipment */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Ausstattung
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({formData.features.length} ausgewählt)
              </span>
            </h2>
            <div className="space-y-6">
              {Object.entries(EQUIPMENT_CATEGORIES).map(([category, features]) => (
                <div key={category}>
                  <h3 className="font-medium text-slate-700 mb-3">{category}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {features.map(feature => (
                      <label
                        key={feature}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          formData.features.includes(feature)
                            ? 'bg-orange-50 border-orange-500 text-orange-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="sr-only"
                        />
                        {formData.features.includes(feature) && (
                          <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        )}
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Description */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Beschreibung</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kurze Highlights</label>
                <input
                  type="text"
                  name="highlights"
                  value={formData.highlights}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. Top gepflegt, Vollausstattung, Scheckheft komplett"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ausführliche Beschreibung</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                  placeholder="Beschreiben Sie das Fahrzeug ausführlich..."
                />
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Kontaktdaten</h2>
              {settings && (
                <button
                  type="button"
                  onClick={useDefaultContact}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Standard-Daten verwenden
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name / Firma</label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. CashCar GmbH"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. +49 123 4567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. info@cashcar.de"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <input
                  type="text"
                  name="contact_address"
                  value={formData.contact_address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. Musterstraße 123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PLZ</label>
                <input
                  type="text"
                  name="contact_zip"
                  value={formData.contact_zip}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. 12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stadt</label>
                <input
                  type="text"
                  name="contact_city"
                  value={formData.contact_city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="z.B. Berlin"
                />
              </div>
            </div>
          </section>

          {/* Status */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Status</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="text-slate-700">Veröffentlicht</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_reserved"
                  checked={formData.is_reserved}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="text-slate-700">Reserviert</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_sold"
                  checked={formData.is_sold}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="text-slate-700">Verkauft</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="text-slate-700">Top-Angebot (Featured)</span>
              </label>
            </div>
          </section>

          {/* Submit Button (Mobile) */}
          <div className="lg:hidden">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isEditMode ? 'Änderungen speichern' : 'Fahrzeug erstellen'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminInventoryForm;
