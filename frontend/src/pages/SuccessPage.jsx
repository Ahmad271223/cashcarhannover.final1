import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Car, Phone, Mail, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";

const SuccessPage = () => {
  const location = useLocation();
  const carId = location.state?.carId || null;

  const copyId = () => {
    if (carId) {
      navigator.clipboard.writeText(carId);
      toast.success("ID kopiert!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>

          <h1 className="font-heading text-3xl font-bold text-slate-900 mb-4">
            Vielen Dank!
          </h1>

          {carId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-100 rounded-xl p-4 mb-6"
            >
              <p className="text-sm text-slate-500 mb-2">Ihre Fahrzeug-ID:</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-bold text-slate-900">#{carId}</span>
                <button 
                  onClick={copyId}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  title="ID kopieren"
                >
                  <Copy className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Notieren Sie sich diese ID für Rückfragen</p>
            </motion.div>
          )}
          
          <p className="text-lg text-slate-600 mb-8">
            Ihr Fahrzeug wurde erfolgreich eingereicht. Wir werden Ihre Angaben prüfen 
            und uns innerhalb von 24-48 Stunden bei Ihnen melden.
          </p>

          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4">Wie geht es weiter?</h3>
            <ul className="text-left space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">1</span>
                <span>Wir prüfen Ihre Angaben und Fotos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">2</span>
                <span>Wir erstellen ein professionelles Inserat</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">3</span>
                <span>Wir verhandeln für Sie mit Interessenten</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">4</span>
                <span>Wir informieren Sie über Angebote</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-500 mb-8">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+49 178 3563025</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              <span>info@cashcar.de</span>
            </div>
          </div>

          <Link to="/">
            <Button 
              data-testid="back-home-btn"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3"
            >
              Zurück zur Startseite
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Decorative car icon */}
        <div className="flex justify-center mt-8">
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
            <Car className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
