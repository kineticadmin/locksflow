# Locks Flow — Migration Next.js + Fonctionnalites

**Date:** 2026-03-13
**Statut:** Approuve

## Contexte

Site vitrine statique HTML existant pour Locks Flow, salon de locks a Neuilly-sur-Marne (93).
Design editorial sombre, accents orange, typographies Unbounded / DM Sans / Playfair Display.

Objectif : migrer vers Next.js et ajouter prise de RDV, galerie media, et admin.

---

## Stack Technique

- **Framework:** Next.js 14 (App Router)
- **Base de donnees + Stockage:** Supabase (gratuit)
- **Auth admin:** Supabase Auth
- **Notifications:** WhatsApp Business API (Meta) — gratuit jusqu'a 1000 conversations/mois
- **Rappels automatiques:** Next.js Route Handlers (cron via Vercel Cron ou appel manuel)
- **Calendrier:** `react-day-picker`
- **Deploy:** Vercel (gratuit)

---

## Structure du Projet

```
locksflow/site/
├── app/
│   ├── page.tsx                  → Landing page (migration du HTML existant)
│   ├── booking/
│   │   └── page.tsx              → Page de reservation avec calendrier
│   ├── gallery/
│   │   └── page.tsx              → Galerie photos et videos
│   ├── admin/
│   │   ├── login/page.tsx        → Connexion admin
│   │   ├── bookings/page.tsx     → Gestion des rendez-vous
│   │   └── media/page.tsx        → Upload et gestion des medias
│   └── api/
│       ├── bookings/route.ts     → CRUD rendez-vous
│       ├── media/route.ts        → Upload medias
│       └── cron/reminders/route.ts → Envoi rappels 24h avant
├── components/
│   ├── Navbar.tsx
│   ├── Cursor.tsx
│   ├── Marquee.tsx
│   ├── ServiceCard.tsx
│   ├── BookingCalendar.tsx
│   ├── GalleryGrid.tsx
│   └── AdminSidebar.tsx
├── lib/
│   ├── supabase.ts               → Client Supabase
│   └── whatsapp.ts               → Envoi messages WhatsApp Meta API
└── public/images/                → Images locales existantes
```

---

## Base de Donnees Supabase

### Table `bookings`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | Cle primaire |
| name | text | Nom du client |
| phone | text | Numero WhatsApp du client |
| service | text | retwist / depart / detartrage |
| date | date | Date du RDV |
| time | text | Heure (ex: "14:00") |
| status | text | pending / confirmed / cancelled |
| created_at | timestamp | Date de creation |

### Table `media`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | Cle primaire |
| url | text | URL Supabase Storage |
| type | text | photo / video |
| caption | text | Legende optionnelle |
| order | int | Ordre d'affichage |
| created_at | timestamp | Date d'upload |

### Supabase Storage
- Bucket `media` : stockage photos et videos uploadees par l'admin

---

## Flux de Reservation

1. Le client clique "Book ton Flow" sur la landing page
2. Il arrive sur `/booking`
3. Il choisit un service (Retwist, Depart, Detartrage)
4. Un calendrier affiche les jours disponibles (lundi-samedi)
5. Il choisit une heure dans les creneaux libres (9h-19h, tous les 1h)
6. Il remplit : nom + numero WhatsApp
7. Soumission -> enregistrement Supabase -> statut "pending"
8. WhatsApp de confirmation envoye au client
9. WhatsApp de notification envoye au proprietaire du salon
10. Cron job quotidien -> rappel 24h avant envoye au client

---

## Galerie

- Page `/gallery` avec grille masonry-style
- Photos et videos fetchees depuis Supabase (table `media`)
- Videos lues en autoplay muted au hover
- Ordre d'affichage configurable depuis l'admin

---

## Admin

Acces : `/admin/login` protege par Supabase Auth (email + mot de passe)

### Vue Rendez-vous (`/admin/bookings`)
- Liste des RDV avec filtre par date / statut
- Actions : Confirmer (envoie WhatsApp au client), Annuler (envoie WhatsApp au client)
- Vue agenda jour / semaine

### Vue Medias (`/admin/media`)
- Drag & drop upload photo/video
- Gestion de l'ordre d'affichage
- Suppression

---

## Notifications WhatsApp

Trois types de messages (templates Meta approuves) :

1. **Confirmation RDV** (client) : "Bonjour {nom}, ton RDV Locks Flow est confirme le {date} a {heure} pour {service}."
2. **Rappel 24h** (client) : "Rappel : ton RDV Locks Flow est demain a {heure}. On t'attend !"
3. **Nouveau RDV** (proprietaire) : "Nouveau RDV : {nom} — {service} — {date} a {heure} — Tel: {phone}"

---

## Design

- Conserver exactement le style existant : fond noir #080808, orange #F97316, creme #F2EDE5
- Typographies identiques : Unbounded, DM Sans, Playfair Display
- Cursor custom, animations reveal, marquee — tous migres en composants React
- Responsive mobile conserve

---

## Priorites d'implementation

1. Migration landing page en Next.js (fidelite au design existant)
2. Module reservation (calendrier + Supabase + WhatsApp)
3. Galerie media (affichage + integration dans le site)
4. Admin (gestion RDV + upload media)
