import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem("cookie_consent");
    if (!cookieConsent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie_consent", JSON.stringify({
      necessary: true,
      analytics: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem("cookie_consent", JSON.stringify({
      necessary: true,
      analytics: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden pointer-events-auto">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Cookie className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold mb-2">
                    Cookie-Einstellungen
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
                    Notwendige Cookies sind für die Grundfunktionen erforderlich. 
                    Weitere Informationen finden Sie in unserer{" "}
                    <Link to="/datenschutz" className="text-orange-400 hover:underline">
                      Datenschutzerklärung
                    </Link>.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={acceptAll}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
                      data-testid="cookie-accept-all"
                    >
                      Alle akzeptieren
                    </Button>
                    <Button
                      onClick={acceptNecessary}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-800 font-semibold px-6"
                      data-testid="cookie-accept-necessary"
                    >
                      Nur notwendige
                    </Button>
                  </div>
                </div>
                <button
                  onClick={acceptNecessary}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                  aria-label="Schließen"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
