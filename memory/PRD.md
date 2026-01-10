# AutoVerkauf Pro - PRD

## Problem Statement
Webapp für Gebrauchtwagenankauf im Kundenauftrag. Kunden können Fahrzeuge mit bis zu 40 Fotos, allen technischen Daten, FIN, Kontaktdaten und Preisvorstellungen einreichen. Admin-Dashboard zur Verwaltung.

## User Personas
1. **Privatverkäufer** - Will Auto stressfrei zum besten Preis verkaufen
2. **Admin/Händler** - Verwaltet Einreichungen, verhandelt mit Käufern
3. **Partner-Händler** - Möchte Zugang zu Fahrzeugen bekommen

## Core Requirements
- Multi-Step Fahrzeug-Einreichungsformular (7 Schritte)
- Foto-Upload bis 40 Bilder
- Admin-Dashboard mit Login
- Status-Verwaltung (Neu, In Bearbeitung, Inseriert, Verkauft, Abgelehnt)
- E-Mail-Benachrichtigungen (SendGrid)
- Provisionsmodell (2,8% ab 7.500€ / 200€ darunter)

## Implemented Features (January 2025)
- ✅ Landing Page mit Hero, Features, Konditionen, Händler-Partner-Bereich
- ✅ Multi-Step Formular mit Validierung
- ✅ Foto & Dokument Upload (lokal)
- ✅ Admin Login & Dashboard
- ✅ Admin Fahrzeug-Detailansicht
- ✅ Status-Updates & Admin-Notizen
- ✅ Passwort-Änderung für Admin
- ✅ Impressum, Datenschutz, AGB Seiten
- ✅ Rate Limiting (Spam-Schutz)
- ✅ MongoDB Indexierung (Performance)
- ✅ JWT-basierte Authentifizierung

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind + shadcn/ui
- Auth: JWT
- Rate Limiting: slowapi

## Backlog (P0-P2)
### P0 (Kritisch)
- [ ] SendGrid E-Mail einrichten (braucht API-Key)
- [ ] Admin-Passwort von "admin123" ändern

### P1 (Wichtig)
- [ ] Cloud-Storage für Bilder (AWS S3)
- [ ] CAPTCHA für Spam-Schutz
- [ ] Backup-Strategie

### P2 (Nice-to-have)
- [ ] Kunden-Tracking (Status per E-Mail)
- [ ] Statistik-Dashboard mit Grafiken
- [ ] Export-Funktion (Excel/PDF)

## Next Tasks
1. SendGrid API-Key einrichten für E-Mail-Benachrichtigungen
2. Admin-Passwort ändern
3. Bei hohem Traffic: Cloud-Storage einrichten
