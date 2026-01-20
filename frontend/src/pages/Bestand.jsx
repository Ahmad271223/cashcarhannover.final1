import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Car, Search, Filter, ChevronDown, MapPin, Calendar,
  Gauge, Fuel, Settings2, X, ArrowUpDown, Check,
  Phone, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Vordefinierte Filter-Optionen (wie mobile.de)
const BRANDS = [
  "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Opel", "Ford",
  "Skoda", "Seat", "Cupra", "Renault", "Peugeot", "Citroën", "Fiat",
  "Toyota", "Honda", "Mazda", "Nissan", "Hyundai", "Kia",
  "Volvo", "Porsche", "Mini", "Jaguar", "Land Rover", "Jeep",
  "Tesla", "Dacia", "Suzuki", "Mitsubishi", "Subaru", "Lexus",
  "Alfa Romeo", "Chevrolet", "Smart", "Andere"
].sort();

const FUEL_TYPES = [
  "Benzin", "Diesel", "Elektro", "Hybrid (Benzin)", "Hybrid (Diesel)",
  "Plug-in-Hybrid", "Erdgas (CNG)", "Autogas (LPG)", "Wasserstoff"
];

const BODY_TYPES = [
  "Limousine", "Kombi", "SUV/Geländewagen", "Cabrio", "Coupé",
  "Van/Kleinbus", "Sportwagen", "Pickup", "Kleinwagen", "Sonstige"
];

const PRICE_RANGES = [
  { value: "5000", label: "bis 5.000 €" },
  { value: "10000", label: "bis 10.000 €" },
  { value: "15000", label: "bis 15.000 €" },
  { value: "20000", label: "bis 20.000 €" },
  { value: "25000", label: "bis 25.000 €" },
  { value: "30000", label: "bis 30.000 €" },
  { value: "40000", label: "bis 40.000 €" },
  { value: "50000", label: "bis 50.000 €" },
  { value: "75000", label: "bis 75.000 €" },
  { value: "100000", label: "bis 100.000 €" },
  { value: "150000", label: "bis 150.000 €" },
];

const MILEAGE_RANGES = [
  { value: "10000", label: "bis 10.000 km" },
  { value: "25000", label: "bis 25.000 km" },
  { value: "50000", label: "bis 50.000 km" },
  { value: "75000", label: "bis 75.000 km" },
  { value: "100000", label: "bis 100.000 km" },
  { value: "125000", label: "bis 125.000 km" },
  { value: "150000", label: "bis 150.000 km" },
  { value: "200000", label: "bis 200.000 km" },
];

const YEAR_RANGES = [
  { value: "2024", label: "ab 2024" },
  { value: "2023", label: "ab 2023" },
  { value: "2022", label: "ab 2022" },
  { value: "2021", label: "ab 2021" },
  { value: "2020", label: "ab 2020" },
  { value: "2018", label: "ab 2018" },
  { value: "2015", label: "ab 2015" },
  { value: "2010", label: "ab 2010" },
];

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

const Bestand = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedFuelType, setSelectedFuelType] = useState(searchParams.get('fuel_type') || '');
  const [selectedBodyType, setSelectedBodyType] = useState(searchParams.get('body_type') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('price_max') || '');
  const [mileageMax, setMileageMax] = useState(searchParams.get('mileage_max') || '');
  const [yearMin, setYearMin] = useState(searchParams.get('year_min') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  const fetchVehicles = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);
      params.append('sort', sortBy);

      if (searchTerm) params.append('search', searchTerm);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (selectedFuelType) params.append('fuel_type', selectedFuelType);
      if (selectedBodyType) params.append('body_type', selectedBodyType);
      if (priceMax) params.append('price_max', priceMax);
      if (mileageMax) params.append('mileage_max', mileageMax);
      if (yearMin) params.append('year_min', yearMin);

      const response = await fetch(`${API_URL}/api/inventory?${params}`);
      const data = await response.json();

      setVehicles(data.vehicles || []);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(1);
    // eslint-disable-next-line
  }, [searchTerm, selectedBrand, selectedFuelType, selectedBodyType, priceMax, mileageMax, yearMin, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedFuelType('');
    setSelectedBodyType('');
    setPriceMax('');
    setMileageMax('');
    setYearMin('');
    setSortBy('newest');
  };

  const activeFilterCount = [searchTerm, selectedBrand, selectedFuelType, selectedBodyType, priceMax, mileageMax, yearMin].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-xl sm:text-2xl text-slate-900">CashCar</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/verkaufen"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Fahrzeug verkaufen
              </Link>
              <a
                href="tel:+491234567890"
                className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Anrufen</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Aktueller Bestand
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl">
            Entdecken Sie unsere handverlesene Auswahl an Qualitätsfahrzeugen.
            Jedes Fahrzeug wurde sorgfältig geprüft und aufbereitet.
          </p>

          {/* Search Bar */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Marke, Modell oder Inserat-Nr. suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-xl transition-colors font-medium ${showFilters ? 'bg-white text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
            >
              <Filter className="w-5 h-5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Marke</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${selectedBrand ? 'border-orange-500 bg-orange-50' : 'border-slate-200'
                    }`}
                >
                  <option value="">Alle Marken</option>
                  {BRANDS.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Fuel Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kraftstoff</label>
                <select
                  value={selectedFuelType}
                  onChange={(e) => setSelectedFuelType(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${selectedFuelType ? 'border-orange-500 bg-orange-50' : 'border-slate-200'
                    }`}
                >
                  <option value="">Alle Kraftstoffe</option>
                  {FUEL_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Body Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fahrzeugtyp</label>
                <select
                  value={selectedBodyType}
                  onChange={(e) => setSelectedBodyType(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${selectedBodyType ? 'border-orange-500 bg-orange-50' : 'border-slate-200'
                    }`}
                >
                  <option value="">Alle Typen</option>
                  {BODY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Erstzulassung</label>
                <select
                  value={yearMin}
                  onChange={(e) => setYearMin(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${yearMin ? 'border-orange-500 bg-orange-50' : 'border-slate-200'
                    }`}
                >
                  <option value="">Beliebig</option>
                  {YEAR_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Max Price Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preis bis</label>
                <select
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${priceMax ? 'border-orange-500 bg-orange-50' : 'border-slate-200'
                    }`}
                >
                  <option value="">Beliebig</option>
                  {PRICE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Max Mileage Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kilometerstand</label>
                <select
                  value={mileageMax}
                  onChange={(e) => setMileageMax(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${mileageMax ? 'border-orange-500 bg-orange-50' : 'border-slate-200'
                    }`}
                >
                  <option value="">Beliebig</option>
                  {MILEAGE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sortierung</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="newest">Neueste zuerst</option>
                  <option value="price_asc">Preis aufsteigend</option>
                  <option value="price_desc">Preis absteigend</option>
                  <option value="mileage">Kilometerstand</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                <X className="w-4 h-4" />
                Alle Filter zurücksetzen ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <p className="text-slate-600">
            <span className="font-semibold text-slate-900">{pagination.total}</span> Fahrzeuge gefunden
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 sm:h-56 bg-slate-200"></div>
                <div className="p-5">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-slate-200 rounded"></div>
                    <div className="h-8 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Keine Fahrzeuge gefunden</h3>
            <p className="text-slate-500 mb-6">Versuchen Sie, Ihre Suchkriterien anzupassen.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          /* Vehicle Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                to={`/bestand/${vehicle.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                {/* Image */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
                  {vehicle.photos && vehicle.photos.length > 0 ? (
                    <img
                      src={
                        vehicle.photos[0].startsWith('http')
                          ? vehicle.photos[0]
                          : vehicle.photos[0].startsWith('cashcar_uploads/')
                            ? `https://res.cloudinary.com/dktiuq3jr/image/upload/${vehicle.photos[0]}`
                            : `${API_URL}/api/uploads/${vehicle.photos[0]}`
                      }
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-16 h-16 text-slate-300" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {isNewArrival(vehicle.created_at) && (
                      <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Neu eingetroffen
                      </span>
                    )}
                    {vehicle.featured && (
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        Top-Angebot
                      </span>
                    )}
                    {vehicle.is_reserved && (
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        Reserviert
                      </span>
                    )}
                  </div>

                  {/* ID Badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-mono rounded">
                      #{vehicle.id}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                    {vehicle.title || `${vehicle.brand} ${vehicle.model}`}
                  </h3>
                  {vehicle.variant && (
                    <p className="text-slate-500 text-sm mb-3">{vehicle.variant}</p>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{vehicle.first_registration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      <Gauge className="w-4 h-4 text-slate-400" />
                      <span>{formatMileage(vehicle.mileage)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      <Fuel className="w-4 h-4 text-slate-400" />
                      <span>{vehicle.fuel_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      <Settings2 className="w-4 h-4 text-slate-400" />
                      <span>{vehicle.power_hp ? `${vehicle.power_hp} PS` : vehicle.transmission}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-2xl font-bold text-slate-900">
                      {formatPrice(vehicle.price)}
                    </span>
                    {vehicle.price_negotiable && (
                      <span className="text-xs text-slate-500">VB</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => fetchVehicles(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchVehicles(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${pagination.page === pageNum
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => fetchVehicles(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading font-bold text-xl">CashCar</span>
              </div>
              <p className="text-slate-400 text-sm">
                Ihr vertrauenswürdiger Partner für den Fahrzeugkauf und -verkauf.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Startseite</Link></li>
                <li><Link to="/bestand" className="hover:text-white transition-colors">Fahrzeugbestand</Link></li>
                <li><Link to="/verkaufen" className="hover:text-white transition-colors">Fahrzeug verkaufen</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link></li>
                <li><Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link></li>
                <li><Link to="/agb" className="hover:text-white transition-colors">AGB</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} CashCar. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Bestand;
