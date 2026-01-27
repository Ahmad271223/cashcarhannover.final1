import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  FileText,
  User,
  Banknote,
  CheckCircle,
  Loader2,
  Info,
  Shield
} from "lucide-react";
import { getOptimizedImageUrl } from "../utils/imageUtils";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEPS = [
  { id: 1, title: "Fahrzeugdaten", icon: Car },
  { id: 2, title: "Details", icon: Info },
  { id: 3, title: "Fotos", icon: Upload },
  { id: 4, title: "Dokumente", icon: FileText },
  { id: 5, title: "Kontakt", icon: User },
  { id: 6, title: "Preis", icon: Banknote },
  { id: 7, title: "Zusammenfassung", icon: CheckCircle },
];

const FUEL_TYPES = ["Benzin", "Diesel", "Hybrid (Benzin)", "Hybrid (Diesel)", "Elektro", "Erdgas (CNG)", "Autogas (LPG)"];
const TRANSMISSIONS = ["Schaltgetriebe", "Automatik", "Halbautomatik"];
const BODY_TYPES = ["Limousine", "Kombi", "Kleinwagen", "SUV/Geländewagen", "Cabrio/Roadster", "Coupé", "Van/Kleinbus", "Transporter", "Pick-up", "Andere"];
const DOOR_OPTIONS = ["2/3", "4/5", "6/7"];
const COLORS = ["Schwarz", "Weiß", "Silber", "Grau", "Blau", "Rot", "Grün", "Braun", "Beige", "Gold", "Orange", "Gelb", "Andere"];

const CarSubmissionForm = () => {
  const navigate = useNavigate();

  // Initialize from localStorage or default
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('carSubmissionStep');
    return savedStep ? parseInt(savedStep) : 1;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('carSubmissionData');
    return savedData ? JSON.parse(savedData) : {
      // Step 1: Basic
      brand: "",
      model: "",
      variant: "",
      first_registration: "",
      mileage: "",
      // Step 2: Technical
      fuel_type: "",
      transmission: "",
      power_hp: "",
      power_kw: "",
      engine_size: "",
      body_type: "",
      doors: "",
      color: "",
      interior_color: "",
      tuv_until: "",
      previous_owners: "1",
      accident_free: true,
      service_history: false,
      vin: "",
      features: [],
      description: "",
      // Step 3: Photos
      photos: [],
      // Step 4: Documents
      documents: [],
      // Step 5: Contact
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      city: "",
      // Step 6: Pricing
      desired_price: "",
      minimum_price: "",
      competitor_price: "",
      competitor_source: "",
      // Terms
      terms_accepted: false,
      // Anti-spam
      honeypot: "",
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('carSubmissionStep', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('carSubmissionData', JSON.stringify(formData));
  }, [formData]);

  // Hidden honeypot field ref
  const honeypotRef = useCallback((node) => {
    if (node) {
      node.style.position = 'absolute';
      node.style.left = '-9999px';
      node.setAttribute('tabindex', '-1');
      node.setAttribute('autocomplete', 'off');
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data.brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateInput = (field, value) => {
    // Allows only numbers
    const clean = value.replace(/\D/g, '');
    let formatted = clean;

    // Auto-slash after 2 digits, max 2 digits after slash (MM/YY)
    if (clean.length > 2) {
      formatted = clean.slice(0, 2) + '/' + clean.slice(2, 4);
    } else {
      formatted = clean.slice(0, 2);
    }

    updateField(field, formatted);
  };

  const handleMileageChange = (value) => {
    // If user enters comma, allow it (don't format yet)
    if (value.includes(',')) {
      updateField("mileage", value);
      return;
    }

    // Otherwise format as integer immediately
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      updateField("mileage", "");
      return;
    }
    const formatted = new Intl.NumberFormat('de-DE').format(clean);
    updateField("mileage", formatted);
  };

  const handleMileageBlur = () => {
    const value = formData.mileage;
    if (!value) return;

    let raw = value.toString().replace(/\./g, ''); // Remove existing dots

    // Smart comma logic
    if (raw.includes(',')) {
      const parts = raw.split(',');
      const lastPart = parts[parts.length - 1];

      // If suffix is 3 digits (e.g. 10,000), interpret as thousand separator -> Keep number
      if (lastPart.length === 3) {
        raw = raw.replace(/,/g, '');
      } else {
        // Otherwise (e.g. 10,0 or 100,00), interpret as decimal -> Discard decimal part
        raw = parts.slice(0, -1).join('');
      }
    }

    // Final Sanitize & Format
    const clean = raw.replace(/\D/g, '');
    if (!clean) {
      updateField("mileage", "");
    } else {
      const formatted = new Intl.NumberFormat('de-DE').format(clean);
      updateField("mileage", formatted);
    }
  };

  const handleFileUpload = async (files, type) => {
    const setUploading = type === "photos" ? setUploadingPhotos : setUploadingDocs;
    setUploading(true);

    const uploadedFiles = [];
    for (const file of files) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        const response = await axios.post(`${API}/upload`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploadedFiles.push(response.data.url);
      } catch (error) {
        toast.error(`Fehler beim Hochladen: ${file.name}`);
      }
    }

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...uploadedFiles]
    }));
    setUploading(false);

    if (uploadedFiles.length > 0) {
      toast.success(`${uploadedFiles.length} Datei(en) hochgeladen`);
    }
  };

  const removeFile = (type, filename) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(f => f !== filename)
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.brand || !formData.model || !formData.first_registration || !formData.mileage) {
          toast.error("Bitte füllen Sie alle Pflichtfelder aus");
          return false;
        }
        break;
      case 2:
        if (!formData.fuel_type || !formData.transmission || !formData.body_type || !formData.doors || !formData.color || !formData.vin) {
          toast.error("Bitte füllen Sie alle Pflichtfelder aus");
          return false;
        }
        if (formData.vin.length !== 17) {
          toast.error("Die FIN muss genau 17 Zeichen haben");
          return false;
        }
        break;
      case 3:
        if (formData.photos.length < 5) {
          toast.error("Bitte laden Sie mindestens 5 Fotos hoch");
          return false;
        }
        break;
      case 5:
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.city) {
          toast.error("Bitte füllen Sie alle Kontaktdaten aus");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Bitte geben Sie eine gültige E-Mail-Adresse ein");
          return false;
        }
        break;
      case 6:
        if (!formData.desired_price || !formData.minimum_price) {
          toast.error("Bitte geben Sie Wunschpreis und Mindestpreis an");
          return false;
        }
        if (parseFloat(formData.minimum_price) > parseFloat(formData.desired_price)) {
          toast.error("Der Mindestpreis kann nicht höher als der Wunschpreis sein");
          return false;
        }
        break;
      case 7:
        if (!formData.terms_accepted) {
          toast.error("Bitte akzeptieren Sie die Konditionen");
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        brand: formData.brand,
        model: formData.model,
        variant: formData.variant || null,
        first_registration: formData.first_registration,
        mileage: parseInt(formData.mileage.toString().replace(/\./g, '')),
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        power_hp: formData.power_hp ? parseInt(formData.power_hp) : null,
        power_kw: formData.power_kw ? parseInt(formData.power_kw) : null,
        engine_size: formData.engine_size ? parseInt(formData.engine_size) : null,
        body_type: formData.body_type,
        doors: formData.doors,
        color: formData.color,
        interior_color: formData.interior_color || null,
        tuv_until: formData.tuv_until || null,
        previous_owners: parseInt(formData.previous_owners),
        accident_free: formData.accident_free,
        service_history: formData.service_history,
        vin: formData.vin.toUpperCase(),
        photos: formData.photos,
        documents: formData.documents,
        contact: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
        },
        pricing: {
          desired_price: parseFloat(formData.desired_price),
          minimum_price: parseFloat(formData.minimum_price),
          competitor_price: formData.competitor_price ? parseFloat(formData.competitor_price) : null,
          competitor_source: formData.competitor_source || null,
        },
        features: formData.features,
        description: formData.description || null,
        // Anti-spam field (honeypot)
        honeypot: formData.honeypot,
      };

      const response = await axios.post(`${API}/cars`, submitData);

      // Clear localStorage on success
      localStorage.removeItem('carSubmissionData');
      localStorage.removeItem('carSubmissionStep');

      navigate("/erfolg", { state: { carId: response.data.id } });
    } catch (error) {
      console.error("Submit error:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Fehler beim Einreichen. Bitte versuchen Sie es erneut.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = useCallback((e, type) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const maxFiles = type === "photos" ? 40 - formData.photos.length : 10 - formData.documents.length;
    handleFileUpload(files.slice(0, maxFiles), type);
  }, [formData.photos.length, formData.documents.length]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="glass-header fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo bgClass="bg-slate-100" />
            <span className="font-heading font-bold text-xl text-slate-900">CashCarHannover</span>
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex flex-col items-center min-w-[80px] ${index < currentStep - 1 ? 'cursor-pointer' : ''
                      }`}
                    onClick={() => index < currentStep - 1 && setCurrentStep(step.id)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step.id < currentStep
                      ? 'step-completed'
                      : step.id === currentStep
                        ? 'step-active'
                        : 'step-pending'
                      }`}>
                      {step.id < currentStep ? <CheckCircle className="w-5 h-5" /> : step.id}
                    </div>
                    <span className={`text-xs mt-2 text-center ${step.id === currentStep ? 'text-orange-600 font-medium' : 'text-slate-500'
                      }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 md:w-16 h-0.5 mx-2 ${step.id < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="form-step-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step 1: Basic Vehicle Data */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">Fahrzeugdaten</h2>
                      <p className="text-slate-500">Geben Sie die grundlegenden Daten Ihres Fahrzeugs ein.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Marke *</Label>
                        <Select value={formData.brand} onValueChange={(v) => updateField("brand", v)}>
                          <SelectTrigger data-testid="brand-select" className="h-12 bg-slate-50">
                            <SelectValue placeholder="Marke wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map(brand => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="model">Modell *</Label>
                        <Input
                          data-testid="model-input"
                          id="model"
                          value={formData.model}
                          onChange={(e) => updateField("model", e.target.value)}
                          placeholder="z.B. A4, Golf, 3er"
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="variant">Variante (optional)</Label>
                        <Input
                          data-testid="variant-input"
                          id="variant"
                          value={formData.variant}
                          onChange={(e) => updateField("variant", e.target.value)}
                          placeholder="z.B. Avant, GTI, M Sport"
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="first_registration">Erstzulassung *</Label>
                        <Input
                          data-testid="first-registration-input"
                          id="first_registration"
                          value={formData.first_registration}
                          onChange={(e) => handleDateInput("first_registration", e.target.value)}
                          placeholder="MM/JJ"
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="mileage">Kilometerstand *</Label>
                        <div className="relative">
                          <div className="relative">
                            <Input
                              data-testid="mileage-input"
                              id="mileage"
                              type="text"
                              value={formData.mileage}
                              onChange={(e) => handleMileageChange(e.target.value)}
                              onBlur={handleMileageBlur}
                              placeholder="z.B. 85.000"
                              className="h-12 bg-slate-50 pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">km</span>
                          </div>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Technical Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">Technische Details</h2>
                      <p className="text-slate-500">Weitere Informationen zu Ihrem Fahrzeug.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Kraftstoff *</Label>
                        <Select value={formData.fuel_type} onValueChange={(v) => updateField("fuel_type", v)}>
                          <SelectTrigger data-testid="fuel-type-select" className="h-12 bg-slate-50">
                            <SelectValue placeholder="Kraftstoff wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {FUEL_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Getriebe *</Label>
                        <Select value={formData.transmission} onValueChange={(v) => updateField("transmission", v)}>
                          <SelectTrigger data-testid="transmission-select" className="h-12 bg-slate-50">
                            <SelectValue placeholder="Getriebe wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSMISSIONS.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="power_hp">Leistung (PS)</Label>
                        <Input
                          data-testid="power-hp-input"
                          id="power_hp"
                          type="number"
                          value={formData.power_hp}
                          onChange={(e) => updateField("power_hp", e.target.value)}
                          placeholder="z.B. 150"
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="engine_size">Hubraum (ccm)</Label>
                        <Input
                          data-testid="engine-size-input"
                          id="engine_size"
                          type="number"
                          value={formData.engine_size}
                          onChange={(e) => updateField("engine_size", e.target.value)}
                          placeholder="z.B. 1968"
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fahrzeugtyp *</Label>
                        <Select value={formData.body_type} onValueChange={(v) => updateField("body_type", v)}>
                          <SelectTrigger data-testid="body-type-select" className="h-12 bg-slate-50">
                            <SelectValue placeholder="Typ wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {BODY_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Türen *</Label>
                        <Select value={formData.doors} onValueChange={(v) => updateField("doors", v)}>
                          <SelectTrigger data-testid="doors-select" className="h-12 bg-slate-50">
                            <SelectValue placeholder="Türen wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {DOOR_OPTIONS.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Außenfarbe *</Label>
                        <Select value={formData.color} onValueChange={(v) => updateField("color", v)}>
                          <SelectTrigger data-testid="color-select" className="h-12 bg-slate-50">
                            <SelectValue placeholder="Farbe wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {COLORS.map(color => (
                              <SelectItem key={color} value={color}>{color}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tuv_until">TÜV bis</Label>
                        <Input
                          data-testid="tuv-input"
                          id="tuv_until"
                          value={formData.tuv_until}
                          onChange={(e) => handleDateInput("tuv_until", e.target.value)}
                          placeholder="MM/JJ"
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="previous_owners">Anzahl Vorbesitzer *</Label>
                        <Input
                          data-testid="previous-owners-input"
                          id="previous_owners"
                          type="number"
                          min="1"
                          value={formData.previous_owners}
                          onChange={(e) => updateField("previous_owners", e.target.value)}
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vin">Fahrzeug-Identifizierungsnummer (FIN) *</Label>
                        <Input
                          data-testid="vin-input"
                          id="vin"
                          value={formData.vin}
                          onChange={(e) => updateField("vin", e.target.value.toUpperCase())}
                          placeholder="17-stellige FIN"
                          maxLength={17}
                          className="h-12 bg-slate-50 font-mono uppercase"
                        />
                        <p className="text-xs text-slate-500">Die FIN finden Sie im Fahrzeugschein (Feld E)</p>
                      </div>

                      <div className="md:col-span-2 flex flex-wrap gap-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            data-testid="accident-free-checkbox"
                            id="accident_free"
                            checked={formData.accident_free}
                            onCheckedChange={(checked) => updateField("accident_free", checked)}
                          />
                          <Label htmlFor="accident_free" className="cursor-pointer">Unfallfrei</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            data-testid="service-history-checkbox"
                            id="service_history"
                            checked={formData.service_history}
                            onCheckedChange={(checked) => updateField("service_history", checked)}
                          />
                          <Label htmlFor="service_history" className="cursor-pointer">Scheckheftgepflegt</Label>
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="description">Beschreibung / Besonderheiten (optional)</Label>
                        <Textarea
                          data-testid="description-textarea"
                          id="description"
                          value={formData.description}
                          onChange={(e) => updateField("description", e.target.value)}
                          placeholder="Zusätzliche Informationen, Ausstattungsmerkmale, Zustand, etc."
                          rows={4}
                          className="bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Photos */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">Fotos hochladen</h2>
                      <p className="text-slate-500">Laden Sie bis zu 40 Fotos Ihres Fahrzeugs hoch (mindestens 5).</p>
                    </div>

                    <div
                      className="drop-zone cursor-pointer"
                      onDrop={(e) => handleDrop(e, "photos")}
                      onDragOver={handleDragOver}
                      onClick={() => document.getElementById("photo-input").click()}
                    >
                      {uploadingPhotos ? (
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                      ) : (
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      )}
                      <p className="text-slate-600 font-medium">Fotos hierher ziehen oder klicken</p>
                      <p className="text-sm text-slate-400 mt-2">JPG, PNG oder WebP - max. 10MB pro Bild</p>
                      <input
                        id="photo-input"
                        data-testid="photo-input"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(Array.from(e.target.files), "photos")}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{formData.photos.length} / 40 Fotos hochgeladen</span>
                      <span className={formData.photos.length >= 5 ? "text-emerald-600" : "text-orange-500"}>
                        {formData.photos.length >= 5 ? "Mindestanzahl erreicht" : `Noch ${5 - formData.photos.length} Fotos benötigt`}
                      </span>
                    </div>

                    {formData.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.photos.map((photo, index) => (
                          <div key={photo} className="image-preview">
                            <img src={getOptimizedImageUrl(photo, 400)} alt={`Foto ${index + 1}`} />
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => removeFile("photos", photo)}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Documents */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">Dokumente (optional)</h2>
                      <p className="text-slate-500">Laden Sie optionale Dokumente wie TÜV-Berichte, Serviceheft oder Gutachten hoch.</p>
                    </div>

                    <div
                      className="drop-zone cursor-pointer"
                      onDrop={(e) => handleDrop(e, "documents")}
                      onDragOver={handleDragOver}
                      onClick={() => document.getElementById("doc-input").click()}
                    >
                      {uploadingDocs ? (
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                      ) : (
                        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      )}
                      <p className="text-slate-600 font-medium">Dokumente hierher ziehen oder klicken</p>
                      <p className="text-sm text-slate-400 mt-2">PDF, DOC oder Bilder - max. 10MB pro Datei</p>
                      <input
                        id="doc-input"
                        data-testid="doc-input"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(Array.from(e.target.files), "documents")}
                      />
                    </div>

                    {formData.documents.length > 0 && (
                      <div className="space-y-2">
                        {formData.documents.map((doc) => (
                          <div key={doc} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-slate-400" />
                              <span className="text-sm text-slate-700">{doc}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile("documents", doc)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Contact */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">Ihre Kontaktdaten</h2>
                      <p className="text-slate-500">Wie können wir Sie erreichen?</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Vorname *</Label>
                        <Input
                          data-testid="first-name-input"
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => updateField("first_name", e.target.value)}
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="last_name">Nachname *</Label>
                        <Input
                          data-testid="last-name-input"
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => updateField("last_name", e.target.value)}
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-Mail *</Label>
                        <Input
                          data-testid="email-input"
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon *</Label>
                        <Input
                          data-testid="phone-input"
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="+49..."
                          className="h-12 bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="city">Stadt/Ort *</Label>
                        <Input
                          data-testid="city-input"
                          id="city"
                          value={formData.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          className="h-12 bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Pricing */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">Preisvorstellung</h2>
                      <p className="text-slate-500">Nennen Sie uns Ihren Wunschpreis und den Preis, mit dem Sie auch zufrieden wären.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                        <Label htmlFor="desired_price" className="text-lg font-medium text-slate-900">Wunschpreis *</Label>
                        <p className="text-sm text-slate-500 mb-3">Der Preis, den Sie sich für Ihr Fahrzeug wünschen.</p>
                        <div className="relative">
                          <Input
                            data-testid="desired-price-input"
                            id="desired_price"
                            type="number"
                            value={formData.desired_price}
                            onChange={(e) => updateField("desired_price", e.target.value)}
                            placeholder="z.B. 15000"
                            className="h-14 bg-white text-xl font-semibold pl-8"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">€</span>
                        </div>
                      </div>

                      <div className="bg-slate-100 border border-slate-200 rounded-xl p-6">
                        <Label htmlFor="minimum_price" className="text-lg font-medium text-slate-900">Mindestpreis *</Label>
                        <p className="text-sm text-slate-500 mb-3">Der Preis, mit dem Sie auch noch zufrieden wären.</p>
                        <div className="relative">
                          <Input
                            data-testid="minimum-price-input"
                            id="minimum_price"
                            type="number"
                            value={formData.minimum_price}
                            onChange={(e) => updateField("minimum_price", e.target.value)}
                            placeholder="z.B. 13500"
                            className="h-14 bg-white text-xl font-semibold pl-8"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">€</span>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-6">
                        <Label className="text-lg font-medium text-slate-900">Vergleichsangebot (optional)</Label>
                        <p className="text-sm text-slate-500 mb-3">Haben Sie bereits ein Angebot von wirkaufendeinauto.de, Autohaus o.ä.?</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="relative">
                            <Input
                              data-testid="competitor-price-input"
                              type="number"
                              value={formData.competitor_price}
                              onChange={(e) => updateField("competitor_price", e.target.value)}
                              placeholder="Angebotspreis"
                              className="h-12 bg-slate-50 pl-8"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                          </div>
                          <Input
                            data-testid="competitor-source-input"
                            value={formData.competitor_source}
                            onChange={(e) => updateField("competitor_source", e.target.value)}
                            placeholder="Quelle (z.B. wirkaufendeinauto.de)"
                            className="h-12 bg-slate-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7: Summary */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">Zusammenfassung</h2>
                      <p className="text-slate-500">Überprüfen Sie Ihre Angaben vor dem Absenden.</p>
                    </div>

                    <div className="space-y-6">
                      {/* Vehicle Info */}
                      <div className="bg-slate-50 rounded-xl p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <Car className="w-5 h-5" />
                          Fahrzeug
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Marke/Modell:</span>
                            <p className="font-medium">{formData.brand} {formData.model} {formData.variant}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Erstzulassung:</span>
                            <p className="font-medium">{formData.first_registration}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Kilometerstand:</span>
                            <p className="font-medium">{parseInt(formData.mileage).toLocaleString('de-DE')} km</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Kraftstoff:</span>
                            <p className="font-medium">{formData.fuel_type}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Getriebe:</span>
                            <p className="font-medium">{formData.transmission}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Fahrzeugtyp:</span>
                            <p className="font-medium">{formData.body_type}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Farbe:</span>
                            <p className="font-medium">{formData.color}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">FIN:</span>
                            <p className="font-mono font-medium">{formData.vin}</p>
                          </div>
                        </div>
                      </div>

                      {/* Media */}
                      <div className="bg-slate-50 rounded-xl p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <Upload className="w-5 h-5" />
                          Medien
                        </h3>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <span className="text-slate-500">Fotos:</span>
                            <p className="font-medium">{formData.photos.length} hochgeladen</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Dokumente:</span>
                            <p className="font-medium">{formData.documents.length} hochgeladen</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="bg-slate-50 rounded-xl p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Kontakt
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Name:</span>
                            <p className="font-medium">{formData.first_name} {formData.last_name}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">E-Mail:</span>
                            <p className="font-medium">{formData.email}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Telefon:</span>
                            <p className="font-medium">{formData.phone}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Stadt:</span>
                            <p className="font-medium">{formData.city}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <Banknote className="w-5 h-5" />
                          Preisvorstellung
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-500 text-sm">Wunschpreis:</span>
                            <p className="text-2xl font-bold text-slate-900">{parseFloat(formData.desired_price).toLocaleString('de-DE')} €</p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-sm">Mindestpreis:</span>
                            <p className="text-2xl font-bold text-slate-900">{parseFloat(formData.minimum_price).toLocaleString('de-DE')} €</p>
                          </div>
                        </div>
                        {formData.competitor_price && (
                          <div className="mt-4 pt-4 border-t border-orange-200">
                            <span className="text-slate-500 text-sm">Vergleichsangebot:</span>
                            <p className="font-medium">{parseFloat(formData.competitor_price).toLocaleString('de-DE')} € ({formData.competitor_source})</p>
                          </div>
                        )}
                      </div>

                      {/* Terms & Conditions */}
                      <div className="bg-slate-900 text-white rounded-xl p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5 text-orange-400" />
                          Konditionen & Provision
                        </h3>
                        <div className="space-y-3 text-sm text-slate-300">
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <span>Das Einreichen ist <strong className="text-white">kostenlos und unverbindlich</strong>.</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <span>Finden wir keinen Käufer, entstehen Ihnen <strong className="text-white">keine Kosten</strong>.</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <span>Sie haben <strong className="text-white">keinerlei Verkaufszwang</strong> – Sie entscheiden, ob Sie verkaufen.</span>
                          </p>
                          {/* Provision details hidden as requested */}
                          {/* <div className="border-t border-slate-700 my-4"></div>
                          <p className="text-slate-400">Bei erfolgreichem Verkauf:</p>
                          <p className="flex items-start gap-2">
                            <Banknote className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                            <span>Ab <strong className="text-white">7.500 €</strong> Verkaufspreis: <strong className="text-orange-400">2,8% Provision</strong> (je 1,4% für Käufer & Verkäufer)</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <Banknote className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                            <span>Bis <strong className="text-white">7.499 €</strong> Verkaufspreis: <strong className="text-orange-400">200 € Pauschale</strong> (je 100 € für Käufer & Verkäufer)</span>
                          </p> */}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-700">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              data-testid="terms-checkbox"
                              id="terms_accepted"
                              checked={formData.terms_accepted}
                              onCheckedChange={(checked) => updateField("terms_accepted", checked)}
                              className="mt-1 border-slate-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                            />
                            <Label htmlFor="terms_accepted" className="cursor-pointer text-sm text-slate-300 leading-relaxed">
                              Ich habe die Konditionen gelesen und akzeptiere diese. Mir ist bewusst, dass ich <strong className="text-white">nicht zum Verkauf verpflichtet</strong> bin
                              und <strong className="text-white">keine Kosten</strong> entstehen, wenn kein Verkauf zustande kommt.
                            </Label>
                          </div>
                        </div>

                        {/* Hidden honeypot field - spam protection */}
                        <input
                          ref={honeypotRef}
                          type="text"
                          name="website"
                          value={formData.honeypot}
                          onChange={(e) => updateField("honeypot", e.target.value)}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6"
                data-testid="prev-step-btn"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                  data-testid="next-step-btn"
                >
                  Weiter
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                  data-testid="submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird eingereicht...
                    </>
                  ) : (
                    <>
                      Jetzt einreichen
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarSubmissionForm;
