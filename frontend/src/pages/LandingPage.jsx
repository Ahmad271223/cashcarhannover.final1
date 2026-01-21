import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Mail,
  Lightbulb,
  Building,
  MapPin,
  User,
  Menu,
  X,
  FileCheck
} from "lucide-react";

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      title: "Wir leiten es weiter",
      description: "Wir erstellen ein professionelles Prospekt und bewerben Ihr Fahrzeuge an unsere Partner."
    },
    {
      number: "03",
      icon: Handshake,
      title: "Verkauf & Auszahlung",
      description: "Nach erfolgreichem Verkauf erhalten Sie Ihr Geld schnell und sicher."
    },
    {
      number: "04",
      icon: FileCheck,
      title: "Kostenlose Abmeldung",
      description: "Wir übernehmen für Sie den kompletten Behördengang und melden Ihr Fahrzeug zuverlässig ab."
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
            <span className="font-heading font-bold text-xl text-slate-900">CashCarHannover</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/bestand" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Fahrzeugbestand</Link>
            <a href="#vorteile" className="text-slate-600 hover:text-slate-900 transition-colors">Vorteile</a>
            <a href="#ablauf" className="text-slate-600 hover:text-slate-900 transition-colors">So funktioniert&apos;s</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/verkaufen" className="hidden sm:block">
              <Button
                data-testid="hero-cta-btn"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all"
              >
                Jetzt verkaufen
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100"
            >
              <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-2">
                <Link
                  to="/bestand"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50 text-slate-700 font-medium transition-colors"
                >
                  <Car className="w-5 h-5 text-orange-500" />
                  Fahrzeugbestand
                </Link>
                <Link
                  to="/verkaufen"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50 text-slate-700 font-medium transition-colors"
                >
                  <Upload className="w-5 h-5 text-orange-500" />
                  Fahrzeug verkaufen
                </Link>
                <a
                  href="#vorteile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 text-slate-400" />
                  Vorteile
                </a>
                <a
                  href="#ablauf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                >
                  <Lightbulb className="w-5 h-5 text-slate-400" />
                  So funktioniert&apos;s
                </a>
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <a
                    href="tel:+491234567890"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900 text-white font-medium"
                  >
                    <Phone className="w-5 h-5" />
                    +49 178 3563 025
                  </a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1668692753736-a3a203aaabec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxjYXIlMjBkZWFsZXJzaGlwJTIwc2hvd3Jvb20lMjBsdXh1cnklMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzY4MDQ4MzMzfDA&ixlib=rb-4.1.0&q=85"
            alt="Showroom Background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-slate-50"></div>
        </div>
        <div className="absolute inset-0 hero-pattern opacity-30 z-0"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight leading-none text-slate-900 mb-6">
              Ihr Auto zum besten Preis verkaufen
              <span className="block text-orange-500 mt-2">& das Stressfrei nur bei uns.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
              Wir verkaufen Ihr Fahrzeug im Kundenauftrag. Professionell,
              hart verhandelt, bestmöglicher Preis - ohne Stress für Sie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/verkaufen">
                <Button
                  data-testid="hero-main-cta"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg btn-orange-glow transition-all active:scale-95 text-lg w-full sm:w-auto"
                >
                  Fahrzeug einreichen
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/bestand">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-lg text-lg w-full sm:w-auto"
                >
                  <Car className="mr-2 w-5 h-5" />
                  Fahrzeugbestand
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Kostenlos & unverbindlich</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>1.000+ Partner-Händler</span>
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
                  <p className="font-semibold text-slate-900">1.000+ Händler</p>
                  <p className="text-sm text-slate-500">deutschlandweit</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pro Tip Section */}
      <section className="py-12 px-6 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold text-white mb-3">
                  Unser Tipp: Holen Sie sich zuerst ein Vergleichsangebot
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Lassen Sie Ihr Fahrzeug kostenlos bei Ihrem lokalen Autohändler bewerten oder holen Sie sich ein
                  Inzahlungnahme-Angebot bei Ankaufsunternehmen wie <span className="text-orange-400 font-medium">wirkaufendeinauto.de</span>.
                  Kommen Sie dann mit diesem Preis zu uns – wir helfen Ihnen, einen <span className="text-orange-400 font-medium">besseren Preis zu erzielen</span>.
                </p>
              </div>
            </div>
          </div>
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
            <p className="text-sm text-orange-500 uppercase tracking-wider font-medium mb-4">In 4 Schritten</p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              So funktioniert&apos;s
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Pricing Transparency Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm text-orange-500 uppercase tracking-wider font-medium mb-4">Transparent & Fair</p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Unsere Konditionen
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">Einreichen kostenlos</h3>
              <p className="text-slate-600 text-sm">Das Einreichen Ihres Fahrzeugs ist komplett kostenlos und unverbindlich.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">Kein Verkaufszwang</h3>
              <p className="text-slate-600 text-sm">Kein Käufer gefunden? Kostet nichts. Nicht verkaufen wollen? Auch kostenlos.</p>
            </motion.div>

            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Banknote className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">Nur bei Erfolg</h3>
              <p className="text-slate-600 text-sm">Provision nur bei erfolgreichem Verkauf – fair geteilt zwischen Käufer & Verkäufer.</p>
            </motion.div> */}
          </div>

          {/* Provisionsmodell section hidden as per request */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-slate-100">
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
              Kostenlos und unverbindlich – Sie zahlen nur bei erfolgreichem Verkauf.
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

      {/* Dealer Partner Section */}
      <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1758599543152-a73184816eba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxoYW5kc2hha2UlMjBidXNpbmVzcyUyMGRlYWwlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzY4MDQ4MzM2fDA&ixlib=rb-4.1.0&q=85"
            alt="Business Partnership"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Handshake className="w-4 h-4" />
                Für Händler
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-6">
                Sie sind Autohändler? Werden Sie Partner!
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Wir arbeiten aktuell mit über <span className="text-orange-400 font-semibold">1.000 Händlern</span> deutschlandweit zusammen.
                Profitieren Sie von unserem Netzwerk und erhalten Sie exklusiven Zugang zu geprüften Fahrzeugen von Privatverkäufern.
              </p>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Zugang zu vorgeprüften Fahrzeugen</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Faire Provisionskonditionen</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Professionelle Abwicklung</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            >
              <h3 className="font-heading text-xl font-semibold mb-6">Jetzt Partner werden</h3>
              <p className="text-slate-300 text-sm mb-6">
                Senden Sie uns eine E-Mail mit folgenden Angaben:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Unternehmensname</p>
                    <p className="text-sm text-slate-400">Name Ihres Autohauses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Ansprechpartner</p>
                    <p className="text-sm text-slate-400">Vor- und Nachname</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Standort & Adresse</p>
                    <p className="text-sm text-slate-400">Vollständige Geschäftsadresse</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Telefon & E-Mail</p>
                    <p className="text-sm text-slate-400">Ihre Kontaktdaten</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href="mailto:partner@cashcarhannover.de?subject=Händler-Partnerschaft%20Anfrage&body=Unternehmensname:%20%0A%0AAnsprechpartner%20(Vor-%20und%20Nachname):%20%0A%0AStandort%20%26%20Adresse:%20%0A%0ATelefon:%20%0A%0AE-Mail:%20%0A%0AWeitere%20Informationen:%20"
                  className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-4 rounded-lg transition-all"
                >
                  <Mail className="w-5 h-5" />
                  partner@cashcarhannover.de
                </a>
                <p className="text-center text-slate-400 text-xs mt-3">
                  Wir melden uns innerhalb von 48 Stunden
                </p>
              </div>
            </motion.div>
          </div>
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
                <span className="font-heading font-bold text-xl">CashCarHannover</span>
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
                  +49 178 3563 025
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@cashcarhannover.de
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/bestand" className="hover:text-white transition-colors">Fahrzeugbestand</Link></li>
                <li><a href="#vorteile" className="hover:text-white transition-colors">Vorteile</a></li>
                <li><a href="#ablauf" className="hover:text-white transition-colors">So funktioniert&apos;s</a></li>
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
            <p>&copy; {new Date().getFullYear()} CashCar UG. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
