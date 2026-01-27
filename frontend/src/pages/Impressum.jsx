import { Link } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { Car, ArrowLeft } from "lucide-react";

const Impressum = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="glass-header fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo bgClass="bg-slate-100" />
            <span className="font-heading font-bold text-xl text-slate-900">CashCarHannover</span>
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Startseite
          </Link>

          <h1 className="font-heading text-4xl font-bold text-slate-900 mb-8">Impressum</h1>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Angaben gemäß § 5 TMG</h2>
              <p className="text-slate-600 leading-relaxed">
                CashCar UG (haftungsbeschränkt)<br />
                Musterstraße 123<br />
                12345 Musterstadt<br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Kontakt</h2>
              <p className="text-slate-600 leading-relaxed">
                Telefon: +49 123 4567890<br />
                E-Mail: info@cashcarhannover.de
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Vertreten durch</h2>
              <p className="text-slate-600 leading-relaxed">
                Geschäftsführer: Max Mustermann
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Registereintrag</h2>
              <p className="text-slate-600 leading-relaxed">
                Eintragung im Handelsregister<br />
                Registergericht: Amtsgericht Musterstadt<br />
                Registernummer: HRB 123456
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Umsatzsteuer-ID</h2>
              <p className="text-slate-600 leading-relaxed">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE123456789
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p className="text-slate-600 leading-relaxed">
                Max Mustermann<br />
                Musterstraße 123<br />
                12345 Musterstadt
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Streitschlichtung</h2>
              <p className="text-slate-600 leading-relaxed">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline ml-1">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Haftung für Inhalte</h2>
              <p className="text-slate-600 leading-relaxed">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
                allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
                zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
                Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt
                der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
                Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Haftung für Links</h2>
              <p className="text-slate-600 leading-relaxed">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
                Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
                verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">Urheberrecht</h2>
              <p className="text-slate-600 leading-relaxed">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
                Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb
                der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw.
                Erstellers.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} CashCar. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
};

export default Impressum;
