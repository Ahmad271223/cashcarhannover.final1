import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Shield, 
  Banknote, 
  Clock, 
  CheckCircle, 
  Upload, 
  MessageSquare, 
  Handshake,
  ChevronRight,
  Phone,
  Mail
} from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: Shield,
      title: "Professionelle Abwicklung",
      description: "Wir übernehmen die komplette Verhandlung mit potenziellen Käufern."
    },
    {
      icon: Banknote,
      title: "Bestpreis erzielen",
      description: "Durch unser Netzwerk und Erfahrung holen wir mehr für Sie raus."
    },
    {
      icon: Clock,
      title: "Zeitsparend",
      description: "Keine nervigen Besichtigungen und Verhandlungen für Sie."
    }
  ];

  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Fahrzeug eintragen",
      description: "Laden Sie Fotos hoch und geben Sie alle Details zu Ihrem Fahrzeug an."
    },
    {
      number: "02",
      icon: MessageSquare,
      title: "Wir inserieren",
      description: "Wir erstellen ein professionelles Inserat und bewerben Ihr Fahrzeug."
    },
    {
      number: "03",
      icon: Handshake,
      title: "Verkauf & Auszahlung",
      description: "Nach erfolgreichem Verkauf erhalten Sie Ihr Geld schnell und sicher."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="glass-header fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">AutoVerkauf Pro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#vorteile" className="text-slate-600 hover:text-slate-900 transition-colors">Vorteile</a>
            <a href="#ablauf" className="text-slate-600 hover:text-slate-900 transition-colors">So funktioniert's</a>
            <Link to="/admin" className="text-slate-600 hover:text-slate-900 transition-colors">Admin</Link>
          </nav>
          <Link to="/verkaufen">
            <Button 
              data-testid="hero-cta-btn"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all"
            >
              Jetzt verkaufen
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-50"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight leading-none text-slate-900 mb-6">
              Ihr Auto verkaufen.
              <span className="text-orange-500"> Stressfrei.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
              Wir verkaufen Ihr Fahrzeug im Kundenauftrag. Professionell inseriert, 
              hart verhandelt, bestmöglicher Preis - ohne Stress für Sie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/verkaufen">
                <Button 
                  data-testid="hero-main-cta"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg btn-orange-glow transition-all active:scale-95 text-lg"
                >
                  Fahrzeug einreichen
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#ablauf">
                <Button 
                  variant="outline" 
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-lg text-lg"
                >
                  So funktioniert's
                </Button>
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Kostenlos & unverbindlich</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Keine versteckten Gebühren</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1760713164476-7eb5063b3d07?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBzaWRlJTIwcHJvZmlsZSUyMHN0dWRpbyUyMGxpZ2h0aW5nfGVufDB8fHx8MTc2Nzk2NTg4OXww&ixlib=rb-4.1.0&q=85"
                alt="Premium Fahrzeug"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">500+ Fahrzeuge</p>
                  <p className="text-sm text-slate-500">erfolgreich verkauft</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="vorteile" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm text-orange-500 uppercase tracking-wider font-medium mb-4">Ihre Vorteile</p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Warum mit uns verkaufen?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="feature-card"
              >
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="ablauf" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm text-orange-500 uppercase tracking-wider font-medium mb-4">In 3 Schritten</p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              So funktioniert's
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <span className="font-mono text-4xl font-bold text-slate-200">{step.number}</span>
                  <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center my-6">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/verkaufen">
              <Button 
                data-testid="steps-cta-btn"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg btn-orange-glow transition-all active:scale-95 text-lg"
              >
                Jetzt starten
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <img 
                src="https://images.pexels.com/photos/7144213/pexels-photo-7144213.jpeg"
                alt="Zufriedener Kunde mit Autoschlüssel"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-6">
              Vertrauen Sie auf unsere Erfahrung
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Seit Jahren vermitteln wir erfolgreich Fahrzeuge im Kundenauftrag. 
              Unser Ziel: Den bestmöglichen Preis für Ihr Fahrzeug erzielen - 
              ohne dass Sie sich um nervige Verhandlungen kümmern müssen.
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="font-heading text-4xl font-bold text-orange-500">500+</p>
                <p className="text-slate-400">Autos im 1. Monat</p>
              </div>
              <div>
                <p className="font-heading text-4xl font-bold text-orange-500">98%</p>
                <p className="text-slate-400">Zufriedenheit</p>
              </div>
              <div>
                <p className="font-heading text-4xl font-bold text-orange-500">23%</p>
                <p className="text-slate-400">Mehr Erlös möglich</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-6">
              Bereit, Ihr Auto zu verkaufen?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Tragen Sie jetzt Ihr Fahrzeug ein und lassen Sie uns die Arbeit machen. 
              Kostenlos und unverbindlich.
            </p>
            <Link to="/verkaufen">
              <Button 
                data-testid="final-cta-btn"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-10 py-5 rounded-lg shadow-lg btn-orange-glow transition-all active:scale-95 text-lg"
              >
                Fahrzeug einreichen
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-slate-900" />
                </div>
                <span className="font-heading font-bold text-xl">AutoVerkauf Pro</span>
              </div>
              <p className="text-slate-400 text-sm">
                Ihr Partner für den stressfreien Autoverkauf im Kundenauftrag.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <div className="space-y-2 text-slate-400 text-sm">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +49 123 456 789
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@autoverkauf-pro.de
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#vorteile" className="hover:text-white transition-colors">Vorteile</a></li>
                <li><a href="#ablauf" className="hover:text-white transition-colors">So funktioniert's</a></li>
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
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} AutoVerkauf Pro. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
