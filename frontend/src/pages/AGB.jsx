import { Link } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { Car, ArrowLeft } from "lucide-react";

const AGB = () => {
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

          <h1 className="font-heading text-4xl font-bold text-slate-900 mb-8">Allgemeine Geschäftsbedingungen</h1>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">§ 1 Geltungsbereich</h2>
              <p className="text-slate-600 leading-relaxed">
                (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend &quot;AGB&quot;) gelten für alle Verträge zwischen
                der CashCar UG (haftungsbeschränkt) (nachfolgend &quot;Vermittler&quot;) und dem Fahrzeugverkäufer (nachfolgend &quot;Kunde&quot;)
                über die Vermittlung von Gebrauchtfahrzeugen.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (2) Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, der Vermittler stimmt
                ihrer Geltung ausdrücklich schriftlich zu.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">§ 2 Vertragsgegenstand</h2>
              <p className="text-slate-600 leading-relaxed">
                (1) Der Vermittler bietet die Vermittlung von Gebrauchtfahrzeugen im Kundenauftrag an. Der Vermittler
                handelt dabei ausschließlich als Vermittler und nicht als Käufer oder Verkäufer des Fahrzeugs.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (2) Der Vermittler erstellt im Namen des Kunden Inserate auf verschiedenen Plattformen und führt
                Verhandlungen mit potenziellen Käufern durch.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (3) Der eigentliche Kaufvertrag kommt ausschließlich zwischen dem Kunden und dem Käufer zustande.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">§ 3 Pflichten des Kunden</h2>
              <p className="text-slate-600 leading-relaxed">
                (1) Der Kunde verpflichtet sich, vollständige und wahrheitsgemäße Angaben zum Fahrzeug zu machen.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (2) Der Kunde stellt dem Vermittler aussagekräftige Fotos und alle relevanten Dokumente zur Verfügung.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (3) Der Kunde ist verpflichtet, den Vermittler unverzüglich zu informieren, wenn:
              </p>
              <ul className="list-disc list-inside text-slate-600 mt-2 space-y-2">
                <li>Das Fahrzeug anderweitig verkauft wurde</li>
                <li>Sich wesentliche Änderungen am Fahrzeugzustand ergeben</li>
                <li>Die Preisvorstellung geändert werden soll</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">§ 4 Preisgestaltung und Provision</h2>
              <p className="text-slate-600 leading-relaxed">
                (1) Der Kunde gibt einen Wunschpreis und einen Mindestpreis an. Der Vermittler bemüht sich,
                den bestmöglichen Preis für den Kunden zu erzielen.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (2) Ein Verkauf unter dem angegebenen Mindestpreis erfolgt nur nach ausdrücklicher Zustimmung des Kunden.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (3) Die Provision des Vermittlers wird bei Vertragsabschluss gesondert vereinbart und ist bei
                erfolgreichem Verkauf fällig.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">§ 5 Verkaufsprozess</h2>
              <p className="text-slate-600 leading-relaxed">
                (1) Der Vermittler informiert den Kunden regelmäßig über den Stand der Vermittlung und eingehende Angebote.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (2) Bei Erreichen oder Überschreiten des Wunschpreises sowie bei Angeboten im vereinbarten
                Preisrahmen kontaktiert der Vermittler den Kunden zur Bestätigung.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (3) Die endgültige Entscheidung über den Verkauf liegt ausschließlich beim Kunden.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">§ 6 Haftung</h2>
              <p className="text-slate-600 leading-relaxed">
                (1) Der Vermittler haftet nicht für die Richtigkeit der vom Kunden gemachten Angaben zum Fahrzeug.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (2) Der Vermittler haftet nicht für Mängel am Fahrzeug oder sich daraus ergebende Ansprüche des Käufers.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (3) Die Haftung des Vermittlers für leicht fahrlässig verursachte Schäden ist ausgeschlossen,
                soweit diese nicht Körper, Leben oder Gesundheit betreffen oder wesentliche Vertragspflichten
                (Kardinalpflichten) verletzen.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">§ 7 Vertragsdauer und Kündigung</h2>
              <p className="text-slate-600 leading-relaxed">
                (1) Der Vermittlungsauftrag kann von beiden Seiten jederzeit ohne Angabe von Gründen gekündigt werden.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (2) Im Falle einer Kündigung werden sämtliche Inserate unverzüglich entfernt.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (3) Bereits angefallene Kosten für Inserate oder Werbemaßnahmen können dem Kunden in Rechnung
                gestellt werden.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">§ 8 Datenschutz</h2>
              <p className="text-slate-600 leading-relaxed">
                Die Erhebung und Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung
                und den geltenden Datenschutzgesetzen.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-4">§ 9 Schlussbestimmungen</h2>
              <p className="text-slate-600 leading-relaxed">
                (1) Es gilt das Recht der Bundesrepublik Deutschland.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (2) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit
                der übrigen Bestimmungen unberührt.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                (3) Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist der Sitz des Vermittlers,
                sofern der Kunde Kaufmann ist.
              </p>
            </section>

            <section className="bg-slate-50 rounded-xl p-6 mt-8">
              <p className="text-slate-500 text-sm">
                Stand: Januar 2025
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

export default AGB;
