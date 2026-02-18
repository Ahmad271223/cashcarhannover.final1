import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  Car, ArrowLeft, Phone, Mail, MapPin, Calendar, Gauge, Fuel,
  Settings2, Cog, Palette, Users, Shield, FileCheck, Leaf,
  Check, X, ChevronLeft, ChevronRight, Share2, Heart,
  Printer, Zap, DoorOpen, Droplets, ThermometerSun, Sparkles
} from "lucide-react";
import { getOptimizedImageUrl } from "../utils/imageUtils";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const formatPrice = (price) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
};

const formatMileage = (mileage) => {
  return new Intl.NumberFormat('de-DE').format(mileage) + ' km';
};

// Check if vehicle is new (created within last 7 days)
const isNewArrival = (createdAt) => {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
};

const BestandDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const title = vehicle ? `${vehicle.brand} ${vehicle.model} - ${formatPrice(vehicle.price)}` : 'Fahrzeug';

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        // User cancelled or error
        if (err.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Link in Zwischenablage kopiert!');
    }).catch(() => {
      toast.error('Link konnte nicht kopiert werden');
    });
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`${API_URL}/api/inventory/${id}`);
        if (!response.ok) {
          throw new Error('Fahrzeug nicht gefunden');
        }
        const data = await response.json();
        setVehicle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const nextImage = () => {
    if (vehicle?.photos?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % vehicle.photos.length);
    }
  };

  const prevImage = () => {
    if (vehicle?.photos?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + vehicle.photos.length) % vehicle.photos.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Car className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Fahrzeug nicht gefunden</h1>
        <p className="text-slate-500 mb-6">Das gesuchte Fahrzeug existiert nicht oder ist nicht mehr verfügbar.</p>
        <Link
          to="/bestand"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Bestand
        </Link>
      </div>
    );
  }

  const specs = [
    { icon: Calendar, label: "Erstzulassung", value: vehicle.first_registration },
    { icon: Gauge, label: "Kilometerstand", value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: "Kraftstoff", value: vehicle.fuel_type },
    { icon: Settings2, label: "Getriebe", value: vehicle.transmission },
    { icon: Zap, label: "Leistung", value: vehicle.power_hp ? `${vehicle.power_hp} PS (${vehicle.power_kw} kW)` : null },
    { icon: Cog, label: "Hubraum", value: vehicle.engine_size ? `${vehicle.engine_size} ccm` : null },
    { icon: Car, label: "Fahrzeugtyp", value: vehicle.body_type },
    { icon: DoorOpen, label: "Türen", value: vehicle.doors },
    { icon: Users, label: "Sitzplätze", value: vehicle.seats },
    { icon: Palette, label: "Außenfarbe", value: vehicle.exterior_color },
    { icon: Palette, label: "Innenfarbe", value: vehicle.interior_color },
    { icon: Shield, label: "Vorbesitzer", value: vehicle.previous_owners },
    { icon: FileCheck, label: "HU/AU bis", value: vehicle.tuv_until || vehicle.hu_au },
    { icon: Leaf, label: "Umweltplakette", value: vehicle.environmental_badge },
    { icon: Leaf, label: "Schadstoffklasse", value: vehicle.emission_class },
    { icon: Droplets, label: "Verbrauch komb.", value: vehicle.fuel_consumption_combined ? `${vehicle.fuel_consumption_combined} l/100km` : null },
    { icon: ThermometerSun, label: "CO₂-Emission", value: vehicle.co2_emission ? `${vehicle.co2_emission} g/km` : null },
  ].filter(spec => spec.value);

  return (
    <div className="min-h-screen bg-slate-50">
      {vehicle && (
        <Helmet>
          <title>{`${vehicle.brand} ${vehicle.model} kaufen - ${formatPrice(vehicle.price)} | CashCarHannover`}</title>
          <meta name="description" content={`${vehicle.brand} ${vehicle.model} für ${formatPrice(vehicle.price)} in Hannover kaufen. ${vehicle.fuel_type}, ${vehicle.transmission}, ${formatMileage(vehicle.mileage)}. Jetzt Probefahrt vereinbaren!`} />
          <link rel="canonical" href={`https://www.cashcarhannover.de/bestand/${id}`} />
        </Helmet>
      )}
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-xl sm:text-2xl text-slate-900">CashCarHannover</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/bestand"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zum Bestand
              </Link>

              {/* Share & Print Buttons */}
              <button
                onClick={handleShare}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Teilen"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="hidden sm:block p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors print:hidden"
                title="Drucken"
              >
                <Printer className="w-5 h-5" />
              </button>

              {vehicle.contact_phone && (
                <a
                  href={`tel:${vehicle.contact_phone}`}
                  className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Anrufen</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-900">Startseite</Link>
            <span>/</span>
            <Link to="/bestand" className="hover:text-slate-900">Bestand</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{vehicle.brand} {vehicle.model}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Main Image */}
              <div className="relative aspect-[16/10] bg-slate-100">
                {vehicle.photos && vehicle.photos.length > 0 ? (
                  <>
                    <img
                      src={getOptimizedImageUrl(vehicle.photos[currentImageIndex], 1200)}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setShowGallery(true)}
                    />

                    {vehicle.photos.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6 text-slate-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                        >
                          <ChevronRight className="w-6 h-6 text-slate-700" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm">
                          {currentImageIndex + 1} / {vehicle.photos.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-24 h-24 text-slate-300" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {isNewArrival(vehicle.created_at) && (
                    <span className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Neu eingetroffen
                    </span>
                  )}
                  {vehicle.featured && (
                    <span className="px-3 py-1.5 bg-orange-500 text-white text-sm font-semibold rounded-full">
                      Top-Angebot
                    </span>
                  )}
                  {vehicle.is_reserved && (
                    <span className="px-3 py-1.5 bg-yellow-500 text-white text-sm font-semibold rounded-full">
                      Reserviert
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {vehicle.photos && vehicle.photos.length > 1 && (
                <div className="p-4 border-t border-slate-100">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {vehicle.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                          ? 'border-orange-500 ring-2 ring-orange-500/20'
                          : 'border-transparent hover:border-slate-300'
                          }`}
                      >
                        <img
                          src={getOptimizedImageUrl(photo, 200)}
                          alt={`Bild ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Title & Price (Mobile) */}
            <div className="lg:hidden bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-sm text-slate-500 font-mono">#{vehicle.id}</span>
                  <h1 className="text-2xl font-bold text-slate-900 mt-1">
                    {vehicle.title || `${vehicle.brand} ${vehicle.model}`}
                  </h1>
                  {vehicle.variant && (
                    <p className="text-slate-600 mt-1">{vehicle.variant}</p>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-slate-900">{formatPrice(vehicle.price)}</span>
                {vehicle.price_negotiable && (
                  <span className="text-slate-500 text-sm">VB</span>
                )}
              </div>
              {vehicle.vat_deductible && (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  MwSt. ausweisbar
                </span>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Fahrzeugdaten</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {specs.map((spec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <spec.icon className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">{spec.label}</p>
                      <p className="font-medium text-slate-900">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Condition Badges */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Zustand & Historie</h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${vehicle.accident_free
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {vehicle.accident_free ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {vehicle.accident_free ? 'Unfallfrei' : 'Unfallfahrzeug'}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${vehicle.service_history
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'
                    }`}>
                    {vehicle.service_history ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {vehicle.service_history ? 'Scheckheftgepflegt' : 'Kein Scheckheft'}
                  </span>
                  {vehicle.non_smoker && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <Check className="w-4 h-4" />
                      Nichtraucherfahrzeug
                    </span>
                  )}
                  {vehicle.garage_kept && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <Check className="w-4 h-4" />
                      Garagenfahrzeug
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Ausstattung</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(showAllFeatures ? vehicle.features : vehicle.features.slice(0, 12)).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-slate-700">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm break-words">{feature}</span>
                    </div>
                  ))}
                </div>
                {vehicle.features.length > 12 && (
                  <button
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                    className="mt-4 text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    {showAllFeatures ? 'Weniger anzeigen' : `Alle ${vehicle.features.length} Merkmale anzeigen`}
                  </button>
                )}
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Beschreibung</h2>
                {vehicle.highlights && (
                  <p className="text-orange-600 font-medium mb-4">{vehicle.highlights}</p>
                )}
                <div className="prose prose-slate max-w-none overflow-hidden">
                  <p className="text-slate-600 whitespace-pre-line break-words">{vehicle.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Price Card (Desktop) */}
            <div className="hidden lg:block bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <span className="text-sm text-slate-500 font-mono">#{vehicle.id}</span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">
                {vehicle.title || `${vehicle.brand} ${vehicle.model}`}
              </h1>
              {vehicle.variant && (
                <p className="text-slate-600 mt-1">{vehicle.variant}</p>
              )}

              <div className="my-6 pb-6 border-b border-slate-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">{formatPrice(vehicle.price)}</span>
                  {vehicle.price_negotiable && (
                    <span className="text-slate-500">VB</span>
                  )}
                </div>
                {vehicle.vat_deductible && (
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    MwSt. ausweisbar
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Kontakt</h3>

                {vehicle.contact_name && (
                  <p className="text-slate-700 font-medium">{vehicle.contact_name}</p>
                )}

                {vehicle.contact_phone && (
                  <a
                    href={`tel:${vehicle.contact_phone}`}
                    className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold justify-center shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    {vehicle.contact_phone}
                  </a>
                )}

                {vehicle.contact_email && (
                  <a
                    href={`mailto:${vehicle.contact_email}?subject=Anfrage zu ${vehicle.brand} ${vehicle.model} (${vehicle.id})`}
                    className="flex items-center gap-3 w-full px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium justify-center hover:bg-slate-50 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    E-Mail senden
                  </a>
                )}

                {(vehicle.contact_address || vehicle.contact_city) && (
                  <div className="flex items-start gap-3 text-slate-600 pt-2">
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      {vehicle.contact_address && <p>{vehicle.contact_address}</p>}
                      {vehicle.contact_zip && vehicle.contact_city && (
                        <p>{vehicle.contact_zip} {vehicle.contact_city}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Interest Box */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-600 text-center">
                  <strong className="text-slate-900">Interesse an diesem Fahrzeug?</strong><br />
                  Kontaktieren Sie uns - wir beraten Sie gerne!
                </p>
              </div>
            </div>

            {/* Mobile Contact Card */}
            <div className="lg:hidden bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Kontakt</h3>

              {vehicle.contact_name && (
                <p className="text-slate-700 font-medium mb-4">{vehicle.contact_name}</p>
              )}

              <div className="space-y-3">
                {vehicle.contact_phone && (
                  <a
                    href={`tel:${vehicle.contact_phone}`}
                    className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold justify-center shadow-lg shadow-orange-500/25"
                  >
                    <Phone className="w-5 h-5" />
                    {vehicle.contact_phone}
                  </a>
                )}

                {vehicle.contact_email && (
                  <a
                    href={`mailto:${vehicle.contact_email}?subject=Anfrage zu ${vehicle.brand} ${vehicle.model} (${vehicle.id})`}
                    className="flex items-center gap-3 w-full px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium justify-center hover:bg-slate-50 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    E-Mail senden
                  </a>
                )}

                {(vehicle.contact_address || vehicle.contact_city) && (
                  <div className="flex items-start gap-3 text-slate-600 pt-2">
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      {vehicle.contact_address && <p>{vehicle.contact_address}</p>}
                      {vehicle.contact_zip && vehicle.contact_city && (
                        <p>{vehicle.contact_zip} {vehicle.contact_city}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-600 text-center">
                  <strong className="text-slate-900">Interesse?</strong> Rufen Sie uns an!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Gallery Modal */}
      {showGallery && vehicle.photos && vehicle.photos.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img
              src={getOptimizedImageUrl(vehicle.photos[currentImageIndex], 1600)}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {vehicle.photos.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
                {currentImageIndex + 1} / {vehicle.photos.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} CashCar. Alle Rechte vorbehalten.</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
            <Link to="/agb" className="hover:text-white transition-colors">AGB</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BestandDetail;
