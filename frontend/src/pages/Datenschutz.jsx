import { Link } from "react-router-dom";
import { Car, ArrowLeft } from "lucide-react";

const Datenschutz = () => {
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
        </div>
      </header>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Startseite
          </Link>

          <h1 className="font-heading text-4xl font-bold text-slate-900 mb-8">Datenschutzerklärung</h1>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">1. Datenschutz auf einen Blick</h2>

              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3 mt-6">Allgemeine Hinweise</h3>
              <p className="text-slate-600 leading-relaxed">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
                persönlich identifiziert werden können.
              </p>

              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3 mt-6">Datenerfassung auf dieser Website</h3>
              <p className="text-slate-600 leading-relaxed">
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
                können Sie dem Impressum dieser Website entnehmen.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                <strong>Wie erfassen wir Ihre Daten?</strong><br />
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B.
                um Daten handeln, die Sie in ein Kontaktformular eingeben (Fahrzeugdaten, Kontaktinformationen, Preisvorstellungen).
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
                IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder
                Uhrzeit des Seitenaufrufs).
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">2. Allgemeine Hinweise und Pflichtinformationen</h2>

              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3 mt-6">Datenschutz</h3>
              <p className="text-slate-600 leading-relaxed">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln
                Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften
                sowie dieser Datenschutzerklärung.
              </p>

              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3 mt-6">Hinweis zur verantwortlichen Stelle</h3>
              <p className="text-slate-600 leading-relaxed">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
                CashCar UG (haftungsbeschränkt)<br />
                Musterstraße 123<br />
                12345 Musterstadt<br /><br />
                Telefon: +49 123 4567890<br />
                E-Mail: info@cashcarhannover.de
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">3. Datenerfassung auf dieser Website</h2>

              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3 mt-6">Fahrzeug-Einreichungsformular</h3>
              <p className="text-slate-600 leading-relaxed">
                Wenn Sie uns ein Fahrzeug zur Vermittlung anbieten, erheben wir folgende Daten:
              </p>
              <ul className="list-disc list-inside text-slate-600 mt-4 space-y-2">
                <li>Fahrzeugdaten (Marke, Modell, Baujahr, Kilometerstand, etc.)</li>
                <li>Fahrzeug-Identifizierungsnummer (FIN)</li>
                <li>Fotos und Dokumente des Fahrzeugs</li>
                <li>Kontaktdaten (Name, E-Mail, Telefon, Wohnort)</li>
                <li>Preisvorstellungen (Wunschpreis, Mindestpreis)</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                Diese Daten werden ausschließlich zur Durchführung der Fahrzeugvermittlung verwendet und nicht
                an Dritte weitergegeben, es sei denn, dies ist für die Vermittlung erforderlich (z.B. an potenzielle Käufer).
              </p>

              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3 mt-6">Speicherdauer</h3>
              <p className="text-slate-600 leading-relaxed">
                Ihre Daten werden nach Abschluss der Vermittlung oder nach Widerruf Ihrer Einwilligung gelöscht,
                sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">4. Ihre Rechte</h2>
              <p className="text-slate-600 leading-relaxed">
                Sie haben jederzeit das Recht:
              </p>
              <ul className="list-disc list-inside text-slate-600 mt-4 space-y-2">
                <li>Auskunft über Ihre bei uns gespeicherten Daten zu erhalten</li>
                <li>Die Berichtigung unrichtiger Daten zu verlangen</li>
                <li>Die Löschung Ihrer Daten zu verlangen</li>
                <li>Die Einschränkung der Verarbeitung zu verlangen</li>
                <li>Der Verarbeitung zu widersprechen</li>
                <li>Ihre Daten in einem strukturierten Format zu erhalten (Datenportabilität)</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                Wenn Sie Fragen zum Datenschutz haben, können Sie sich jederzeit an uns wenden.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">5. Cookies</h2>
              <p className="text-slate-600 leading-relaxed">
                Diese Website verwendet nur technisch notwendige Cookies, die für den Betrieb der Website erforderlich
                sind. Es werden keine Tracking- oder Marketing-Cookies verwendet.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">6. SSL-Verschlüsselung</h2>
              <p className="text-slate-600 leading-relaxed">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine
                SSL-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des
                Browsers von &quot;http://&quot; auf &quot;https://&quot; wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
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

export default Datenschutz;
