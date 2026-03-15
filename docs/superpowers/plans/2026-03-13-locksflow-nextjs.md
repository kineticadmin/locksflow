# Locks Flow Next.js Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer le site vitrine Locks Flow de HTML statique vers Next.js 14 avec prise de RDV, galerie media, et interface admin.

**Architecture:** Next.js App Router avec Supabase pour la DB et le stockage fichiers, WhatsApp Business API (Meta) pour les notifications. L'admin est protege par Supabase Auth. Un cron job Vercel envoie les rappels 24h avant chaque RDV.

**Tech Stack:** Next.js 14, TypeScript, Supabase, WhatsApp Meta Cloud API, react-day-picker, Tailwind CSS, Vercel

---

## Chunk 1: Setup & Infrastructure

### Task 1: Init projet Next.js

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- Create: `.env.local.example`

- [ ] **Step 1: Initialiser le projet dans le dossier existant**

```bash
cd /Users/brunellagoosou/locksflow/site
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

- [ ] **Step 2: Installer les dependances**

```bash
npm install @supabase/supabase-js @supabase/ssr react-day-picker date-fns
npm install -D @types/node
```

- [ ] **Step 3: Creer `.env.local.example`**

```bash
cat > .env.local.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
WHATSAPP_ACCESS_TOKEN=your_meta_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
OWNER_WHATSAPP=33749696141
CRON_SECRET=your_random_secret_string
EOF
```

- [ ] **Step 4: Copier en `.env.local` et remplir les valeurs**

```bash
cp .env.local.example .env.local
```

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "feat: init Next.js project with Supabase and Tailwind"
```

---

### Task 2: Configuration Supabase

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Modify: `middleware.ts` (racine)

- [ ] **Step 1: Creer le client Supabase browser**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Creer le client Supabase server**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Creer le middleware Supabase**

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

- [ ] **Step 4: Creer le middleware racine**

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 5: Creer les tables Supabase**

Dans le dashboard Supabase > SQL Editor, executer :

```sql
-- Table bookings
create table bookings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  service text not null check (service in ('retwist', 'depart', 'detartrage')),
  date date not null,
  time text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamp with time zone default now()
);

-- Table media
create table media (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  type text not null check (type in ('photo', 'video')),
  caption text,
  "order" int default 0,
  created_at timestamp with time zone default now()
);

-- Storage bucket media
insert into storage.buckets (id, name, public) values ('media', 'media', true);

-- RLS policies
alter table bookings enable row level security;
alter table media enable row level security;

-- Bookings: lecture et insertion publiques, update/delete admin seulement
create policy "Anyone can insert bookings" on bookings for insert with check (true);
create policy "Authenticated can read bookings" on bookings for select using (auth.role() = 'authenticated');
create policy "Authenticated can update bookings" on bookings for update using (auth.role() = 'authenticated');

-- Media: lecture publique, write admin seulement
create policy "Anyone can read media" on media for select using (true);
create policy "Authenticated can manage media" on media for all using (auth.role() = 'authenticated');

-- Storage: lecture publique, upload admin seulement
create policy "Public read media" on storage.objects for select using (bucket_id = 'media');
create policy "Authenticated upload media" on storage.objects for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "Authenticated delete media" on storage.objects for delete using (bucket_id = 'media' and auth.role() = 'authenticated');
```

- [ ] **Step 6: Creer un compte admin dans Supabase Auth**

Dans Supabase > Authentication > Users > Invite user : entrer ton email et mot de passe.

- [ ] **Step 7: Commit**

```bash
git add lib/ middleware.ts
git commit -m "feat: add Supabase client, server, and middleware setup"
```

---

### Task 3: Client WhatsApp

**Files:**
- Create: `lib/whatsapp.ts`

> **Note WhatsApp Meta API :** Pour les messages initues par l'entreprise (confirmations, rappels), Meta exige des templates pre-approuves (`type: 'template'`). Les messages texte libres (`type: 'text'`) ne fonctionnent que dans la fenetre de 24h apres un message du client. En developpement, le code ci-dessous utilise du texte libre pour tester. En production, soumettre les templates dans Meta Business Manager et remplacer `type: 'text'` par `type: 'template'` avec le nom du template approuve.

- [ ] **Step 1: Creer le module WhatsApp**

```typescript
// lib/whatsapp.ts
const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0'

interface SendMessageParams {
  to: string
  message: string
}

async function sendWhatsApp({ to, message }: SendMessageParams) {
  const phone = to.replace(/\D/g, '')
  const res = await fetch(
    `${WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json()
    console.error('WhatsApp error:', err)
  }
}

export async function notifyClientBookingConfirmed(params: {
  name: string
  phone: string
  service: string
  date: string
  time: string
}) {
  const serviceLabel: Record<string, string> = {
    retwist: 'Retwist',
    depart: 'Depart de Locks',
    detartrage: 'Detartrage',
  }
  await sendWhatsApp({
    to: params.phone,
    message: `Bonjour ${params.name} ! Ton RDV Locks Flow est confirme le ${params.date} a ${params.time} pour ${serviceLabel[params.service]}. A tres vite ! 💧`,
  })
}

export async function notifyOwnerNewBooking(params: {
  name: string
  phone: string
  service: string
  date: string
  time: string
}) {
  const serviceLabel: Record<string, string> = {
    retwist: 'Retwist',
    depart: 'Depart de Locks',
    detartrage: 'Detartrage',
  }
  await sendWhatsApp({
    to: process.env.OWNER_WHATSAPP!,
    message: `Nouveau RDV Locks Flow :\n👤 ${params.name}\n💇 ${serviceLabel[params.service]}\n📅 ${params.date} a ${params.time}\n📱 ${params.phone}`,
  })
}

export async function notifyClientReminder(params: {
  name: string
  phone: string
  time: string
}) {
  await sendWhatsApp({
    to: params.phone,
    message: `Hey ${params.name} ! Rappel : ton RDV Locks Flow est demain a ${params.time}. On t'attend ! 🔥`,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/whatsapp.ts
git commit -m "feat: add WhatsApp notification client"
```

---

## Chunk 2: Landing Page

### Task 4: Design tokens et styles globaux

**Files:**
- Modify: `app/globals.css`
- Create: `app/layout.tsx`

- [ ] **Step 1: Configurer globals.css avec les variables du design existant**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --black: #080808;
  --white: #F2EDE5;
  --orange: #F97316;
  --orange-bright: #FF8C38;
  --gray: #121212;
  --text-muted: #A0A0A0;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  background: var(--black);
  color: var(--white);
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
  cursor: none;
}

body::before {
  content: "";
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: url('https://grainy-gradients.vercel.app/noise.svg');
  opacity: 0.04;
  pointer-events: none;
  z-index: 9999;
}
```

- [ ] **Step 2: Creer le layout racine avec next/font**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Unbounded, DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const unbounded = Unbounded({ subsets: ['latin'], variable: '--font-unbounded', weight: ['400','700','900'] })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', weight: ['300','400','500'] })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', style: ['italic'] })

export const metadata: Metadata = {
  title: 'Locks Flow — More than a Salon, an Attitude',
  description: 'Salon de locks a Neuilly-sur-Marne. Retwist, Depart, Detartrage.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${unbounded.variable} ${dmSans.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Configurer tailwind.config.ts avec les fonts CSS variables et couleurs custom**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#080808',
        cream: '#F2EDE5',
        orange: '#F97316',
        gray: '#121212',
        muted: '#A0A0A0',
      },
      fontFamily: {
        unbounded: ['var(--font-unbounded)', 'sans-serif'],
        dm: ['var(--font-dm-sans)', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx tailwind.config.ts
git commit -m "feat: add global styles and design tokens"
```

---

### Task 5: Composants de base

**Files:**
- Create: `components/Cursor.tsx`
- Create: `components/Navbar.tsx`
- Create: `components/Marquee.tsx`

- [ ] **Step 1: Creer le curseur custom**

```typescript
// components/Cursor.tsx
'use client'
import { useEffect, useRef } from 'react'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const move = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
    }

    const grow = () => cursor.classList.add('big')
    const shrink = () => cursor.classList.remove('big')

    document.addEventListener('mousemove', move)
    document.querySelectorAll('a, .service-card').forEach(el => {
      el.addEventListener('mouseenter', grow)
      el.addEventListener('mouseleave', shrink)
    })

    return () => document.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      ref={cursorRef}
      className="cursor fixed w-3 h-3 bg-orange rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-300"
      style={{ transition: 'transform 0.1s, width 0.3s, height 0.3s' }}
    />
  )
}
```

Ajouter dans `app/globals.css` :

```css
.cursor.big {
  width: 60px !important;
  height: 60px !important;
  opacity: 0.3;
  background: var(--white);
  mix-blend-mode: difference;
}
```

- [ ] **Step 2: Creer la Navbar**

```typescript
// components/Navbar.tsx
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-[1000] px-[50px] py-[30px] flex justify-between items-center">
      <Link href="/" className="font-unbounded font-black text-xl lowercase text-cream">
        locks<span className="text-orange">.</span>flow
      </Link>
      <ul className="hidden md:flex gap-10 list-none items-center">
        <li><Link href="/#about" className="text-cream text-[13px] uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-orange transition-all">L&apos;Attitude</Link></li>
        <li><Link href="/#services" className="text-cream text-[13px] uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-orange transition-all">Le Menu</Link></li>
        <li><Link href="/#community" className="text-cream text-[13px] uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-orange transition-all">Le Crew</Link></li>
        <li>
          <Link href="/booking" className="bg-orange text-black font-bold px-6 py-3 rounded-full text-[13px] uppercase tracking-widest">
            Book ton Flow
          </Link>
        </li>
      </ul>
    </nav>
  )
}
```

- [ ] **Step 3: Creer le Marquee**

```typescript
// components/Marquee.tsx
export default function Marquee() {
  const text = 'RETWIST • DEPART • REPAIR • VIBE • COMMUNITY • NEUILLY-SUR-MARNE • 93 • NO CHEMICALS • JUST ART •\u00a0'

  return (
    <div className="bg-orange text-black py-5 font-unbounded font-black overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-marquee text-[40px]">
        {text}{text}
      </div>
    </div>
  )
}
```

Ajouter dans `tailwind.config.ts` > `theme.extend` :

```typescript
animation: {
  marquee: 'marquee 20s linear infinite',
},
keyframes: {
  marquee: {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-50%)' },
  },
},
```

- [ ] **Step 4: Commit**

```bash
git add components/
git commit -m "feat: add Cursor, Navbar, and Marquee components"
```

---

### Task 6: Landing page complete

**Files:**
- Create: `components/HeroSection.tsx`
- Create: `components/ServicesSection.tsx`
- Create: `components/CommunitySection.tsx`
- Create: `components/FinalCTA.tsx`
- Create: `components/Footer.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Creer HeroSection**

```typescript
// components/HeroSection.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="h-screen w-full relative overflow-hidden flex flex-col justify-center pl-[50px]">
      <video
        className="absolute top-0 left-0 w-full h-full -z-[1] object-cover opacity-40 grayscale-[0.5]"
        autoPlay muted loop playsInline
      >
        <source src="https://player.vimeo.com/external/494252666.sd.mp4?s=72ad57a584cf800d9a0832a9ccb369ad84245d62&profile_id=165&oauth2_token_id=57447761" type="video/mp4" />
      </video>

      <div className="absolute right-[10%] top-[15%] w-[300px] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1] rotate-[5deg] hidden md:block">
        <Image src="/images/Uj-hLv0GjTAvIBmP9qoW8.jpg" alt="Locks Style" width={300} height={400} className="w-full" />
      </div>
      <div className="absolute right-[25%] bottom-[10%] w-[250px] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1] -rotate-[5deg] hidden md:block">
        <Image src="/images/nCXvR6Egslx41-5n8LJAW-7982x5321.jpg" alt="Detail" width={250} height={350} className="w-full" />
      </div>

      <div className="relative z-[2] max-w-[900px]">
        <h1 className="font-unbounded text-[clamp(60px,12vw,140px)] leading-[0.85] font-black uppercase mb-5 text-cream">
          More than<br />just <em className="font-playfair text-orange not-italic lowercase">locks.</em>
        </h1>
        <p className="text-xl max-w-[500px] opacity-70 font-light mb-10 text-cream">
          On ne coiffe pas des cheveux, on sculpte ton identite. Bienvenue dans la communaute Locks Flow.
        </p>
        <Link href="/#services" className="bg-orange text-black font-bold px-10 py-5 rounded-full text-base uppercase tracking-widest">
          Decouvrir l&apos;univers
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Creer ServicesSection**

```typescript
// components/ServicesSection.tsx
const services = [
  { name: 'Le Retwist', description: "L'entretien signature. Precision chirurgicale pour des racines nettes et un cuir chevelu sain.", price: '50€' },
  { name: 'Le Depart', description: 'On pose les bases de ton futur. Methode adaptee a ta texture de cheveu.', price: 'Sur Devis' },
  { name: 'Detartrage', description: 'Le reset total. On libere tes locks des residus pour retrouver legerete et eclat.', price: '40€' },
]

export default function ServicesSection() {
  return (
    <section className="py-[150px] px-[50px] bg-[#080808]" id="services">
      <h2 className="font-unbounded text-[50px] mb-20 text-cream">
        Clean <span className="text-orange">Tools.</span><br />Better <span className="text-orange">Flow.</span>
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[2px] bg-white/10">
        {services.map((s) => (
          <div key={s.name} className="service-card bg-[#080808] p-[60px_40px] transition-all duration-400 hover:bg-orange group">
            <h3 className="font-unbounded text-2xl mb-5 text-cream group-hover:text-black">{s.name}</h3>
            <p className="opacity-60 mb-8 text-cream group-hover:text-black group-hover:opacity-80">{s.description}</p>
            <div className="font-unbounded font-black text-[32px] text-cream group-hover:text-black">{s.price}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Creer CommunitySection**

```typescript
// components/CommunitySection.tsx
import Link from 'next/link'

export default function CommunitySection() {
  return (
    <section className="py-[150px] px-[50px] grid grid-cols-1 md:grid-cols-2 gap-[100px] items-center bg-[#121212]" id="community">
      <div className="w-full aspect-[9/16] bg-[#222] rounded-[20px] relative overflow-hidden border-[8px] border-[#1a1a1a]">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="https://player.vimeo.com/external/394344155.sd.mp4?s=985eb930e461b369c7330263f68484196d4f488a&profile_id=165&oauth2_token_id=57447761" type="video/mp4" />
        </video>
      </div>
      <div>
        <h2 className="font-unbounded text-[60px] leading-none mb-8 text-cream">
          Join the<br /><span className="text-orange">Flow Crew.</span>
        </h2>
        <p className="text-xl opacity-70 mb-8 text-cream font-light">
          C&apos;est pas juste un rendez-vous, c&apos;est un lifestyle. Suis nos transformations quotidiennes et partage ton evolution avec le tag #LocksFlowInspired.
        </p>
        <Link href="https://instagram.com/lock.flowinspired" target="_blank" className="inline-block bg-orange text-black font-unbounded font-black px-8 py-4 rounded-full text-sm">
          Instagram
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Creer FinalCTA**

```typescript
// components/FinalCTA.tsx
import Link from 'next/link'

export default function FinalCTA() {
  return (
    <section className="h-[80vh] flex flex-col justify-center items-center text-center bg-[#080808] relative">
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative z-[2]">
        <h2 className="font-unbounded text-[clamp(40px,8vw,80px)] leading-[0.85] font-black uppercase text-cream mb-10">
          Pret a changer<br />de <em className="font-playfair text-orange not-italic lowercase">dimension ?</em>
        </h2>
        <Link href="/booking" className="inline-block px-[60px] py-[30px] bg-orange text-black font-unbounded font-black rounded-full text-2xl hover:scale-105 hover:shadow-[0_0_50px_#F97316] transition-all">
          Prendre RDV maintenant
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Creer Footer**

```typescript
// components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="px-[50px] py-[50px] border-t border-white/10 flex justify-between items-center flex-wrap gap-5">
        <div className="font-unbounded font-black text-xl lowercase text-cream">
          locks<span className="text-orange">.</span>flow
        </div>
        <div className="text-muted text-xs">© 2025 LOCKS FLOW — DESIGNED FOR THE BOLD.</div>
        <div className="flex gap-5">
          <Link href="#" className="text-cream text-xs">TikTok</Link>
          <Link href="https://instagram.com/lock.flowinspired" target="_blank" className="text-cream text-xs">Instagram</Link>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 6: Assembler la page principale**

```typescript
// app/page.tsx
import Cursor from '@/components/Cursor'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import Marquee from '@/components/Marquee'
import ServicesSection from '@/components/ServicesSection'
import CommunitySection from '@/components/CommunitySection'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Cursor />
      <Navbar />
      <HeroSection />
      <Marquee />
      <ServicesSection />
      <CommunitySection />
      <FinalCTA />
      <Footer />
    </>
  )
}
```

- [ ] **Step 7: Tester le dev server**

```bash
npm run dev
```

Ouvrir http://localhost:3000 — le site doit etre identique au HTML original.

- [ ] **Step 8: Commit**

```bash
git add app/ components/
git commit -m "feat: migrate landing page to Next.js components"
```

---

## Chunk 3: Systeme de Reservation

### Task 7: API Route — Bookings

**Files:**
- Create: `app/api/bookings/route.ts`

- [ ] **Step 1: Creer l'API route pour les reservations**

```typescript
// app/api/bookings/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { notifyClientBookingConfirmed, notifyOwnerNewBooking } from '@/lib/whatsapp'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, service, date, time } = body

  if (!name || !phone || !service || !date || !time) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{ name, phone, service, date, time, status: 'pending' }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const dateFormatted = format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })

  // Notifications WhatsApp (non bloquantes)
  Promise.all([
    notifyClientBookingConfirmed({ name, phone, service, date: dateFormatted, time }),
    notifyOwnerNewBooking({ name, phone, service, date: dateFormatted, time }),
  ]).catch(console.error)

  return NextResponse.json({ success: true, booking: data })
}

export async function GET() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 2: Tester l'API avec curl**

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"33612345678","service":"retwist","date":"2026-03-20","time":"10:00"}'
```

Resultat attendu : `{"success":true,"booking":{...}}`

- [ ] **Step 3: Commit**

```bash
git add app/api/bookings/
git commit -m "feat: add booking API route with WhatsApp notifications"
```

---

### Task 8: API Route — Cron rappels

**Files:**
- Create: `app/api/cron/reminders/route.ts`

- [ ] **Step 1: Creer le cron de rappels**

```typescript
// app/api/cron/reminders/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { notifyClientReminder } from '@/lib/whatsapp'
import { format, addDays } from 'date-fns'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', tomorrow)
    .eq('status', 'confirmed')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await Promise.all(
    (bookings || []).map(b =>
      notifyClientReminder({ name: b.name, phone: b.phone, time: b.time })
    )
  )

  return NextResponse.json({ sent: bookings?.length ?? 0 })
}
```

- [ ] **Step 2: Configurer le cron Vercel dans `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Le cron tourne chaque matin a 8h UTC (envoie rappels pour les RDV du lendemain).

- [ ] **Step 3: Commit**

```bash
git add app/api/cron/ vercel.json
git commit -m "feat: add daily reminder cron job"
```

---

### Task 9: Page de reservation

**Files:**
- Create: `components/BookingCalendar.tsx`
- Create: `app/booking/page.tsx`

- [ ] **Step 1: Creer le composant BookingCalendar**

```typescript
// components/BookingCalendar.tsx
'use client'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, isBefore, startOfDay, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'

const SERVICES = [
  { id: 'retwist', label: 'Le Retwist', price: '50€' },
  { id: 'depart', label: 'Le Depart', price: 'Sur Devis' },
  { id: 'detartrage', label: 'Detartrage', price: '40€' },
]

const TIME_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00']

function isDisabledDay(date: Date) {
  const day = getDay(date)
  return day === 0 || isBefore(date, startOfDay(new Date()))
}

export default function BookingCalendar() {
  const [service, setService] = useState('')
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!service || !date || !time || !name || !phone) {
      setError('Remplis tous les champs.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone: phone.replace(/\D/g, ''),
        service,
        date: format(date, 'yyyy-MM-dd'),
        time,
      }),
    })

    setLoading(false)
    if (res.ok) {
      setSuccess(true)
    } else {
      setError('Une erreur est survenue. Reessaie.')
    }
  }

  if (success) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🔥</div>
        <h2 className="font-unbounded text-3xl text-cream mb-4">C&apos;est dans le flow !</h2>
        <p className="text-cream opacity-70">Tu vas recevoir une confirmation WhatsApp. On t&apos;attend !</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      {/* Choix service */}
      <div className="mb-12">
        <h2 className="font-unbounded text-xl mb-6 text-cream">1. Choisis ton service</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SERVICES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setService(s.id)}
              className={`p-6 border transition-all text-left ${service === s.id ? 'border-orange bg-orange/10' : 'border-white/20 hover:border-orange/50'}`}
            >
              <div className="font-unbounded text-cream mb-1">{s.label}</div>
              <div className="text-orange font-bold">{s.price}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Calendrier */}
      {service && (
        <div className="mb-12">
          <h2 className="font-unbounded text-xl mb-6 text-cream">2. Choisis une date</h2>
          <DayPicker
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={isDisabledDay}
            locale={fr}
            className="rdp-custom"
          />
        </div>
      )}

      {/* Creneaux */}
      {date && (
        <div className="mb-12">
          <h2 className="font-unbounded text-xl mb-6 text-cream">3. Choisis un creneau</h2>
          <div className="grid grid-cols-4 gap-3">
            {TIME_SLOTS.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`py-3 border font-unbounded text-sm transition-all ${time === slot ? 'border-orange bg-orange text-black' : 'border-white/20 text-cream hover:border-orange'}`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Infos client */}
      {time && (
        <div className="mb-12">
          <h2 className="font-unbounded text-xl mb-6 text-cream">4. Tes infos</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Ton prenom"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-transparent border border-white/20 text-cream p-4 outline-none focus:border-orange transition-colors"
            />
            <input
              type="tel"
              placeholder="Ton numero WhatsApp (ex: 0612345678)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="bg-transparent border border-white/20 text-cream p-4 outline-none focus:border-orange transition-colors"
            />
          </div>
        </div>
      )}

      {error && <p className="text-red-400 mb-6">{error}</p>}

      {name && phone && (
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange text-black font-unbounded font-black py-5 text-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {loading ? 'Envoi...' : 'Valider mon RDV'}
        </button>
      )}
    </form>
  )
}
```

- [ ] **Step 2: Creer la page de reservation**

```typescript
// app/booking/page.tsx
import Navbar from '@/components/Navbar'
import BookingCalendar from '@/components/BookingCalendar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Book ton Flow — Locks Flow' }

export default function BookingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] pt-[120px] pb-20 px-[50px]">
        <h1 className="font-unbounded text-[clamp(40px,6vw,80px)] leading-tight font-black uppercase text-cream mb-4">
          Book ton<br /><span className="text-orange">Flow.</span>
        </h1>
        <p className="text-cream opacity-60 mb-16 text-lg max-w-xl">
          Choisis ton service, ta date, et on s&apos;occupe du reste. Confirmation WhatsApp immediate.
        </p>
        <BookingCalendar />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 3: Ajouter les styles react-day-picker dans globals.css**

```css
/* Styles DayPicker custom */
.rdp-custom .rdp-day_selected .rdp-day_button {
  background: #F97316;
  color: #080808;
}
.rdp-custom .rdp-day_button:hover {
  background: rgba(249, 115, 22, 0.2);
}
.rdp-custom {
  --rdp-accent-color: #F97316;
  --rdp-background-color: rgba(249,115,22,0.1);
  color: #F2EDE5;
}
```

- [ ] **Step 4: Tester la page booking**

Ouvrir http://localhost:3000/booking — selectionner service, date, heure, remplir nom/telephone, soumettre.

- [ ] **Step 5: Commit**

```bash
git add components/BookingCalendar.tsx app/booking/
git commit -m "feat: add booking page with calendar and WhatsApp notification"
```

---

## Chunk 4: Galerie & Admin

### Task 10: API Route — Media

**Files:**
- Create: `app/api/media/route.ts`

- [ ] **Step 1: Creer l'API route media**

```typescript
// app/api/media/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const caption = formData.get('caption') as string || ''

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}.${ext}`
  const type = file.type.startsWith('video') ? 'video' : 'photo'

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, file, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName)

  const { data, error } = await supabase
    .from('media')
    .insert([{ url: publicUrl, type, caption }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, media: data })
}

export async function DELETE(req: NextRequest) {
  const { id, url } = await req.json()
  const fileName = url.split('/').pop()

  await supabase.storage.from('media').remove([fileName])
  const { error } = await supabase.from('media').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/media/
git commit -m "feat: add media API route (upload, list, delete)"
```

---

### Task 11: Page Galerie

**Files:**
- Create: `components/GalleryGrid.tsx`
- Create: `app/gallery/page.tsx`

- [ ] **Step 1: Creer le composant GalleryGrid**

```typescript
// components/GalleryGrid.tsx
'use client'

interface MediaItem {
  id: string
  url: string
  type: 'photo' | 'video'
  caption: string | null
}

export default function GalleryGrid({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-cream opacity-40">
        <p className="font-unbounded">Les photos arrivent bientot...</p>
      </div>
    )
  }

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
      {items.map(item => (
        <div key={item.id} className="break-inside-avoid relative group overflow-hidden">
          {item.type === 'video' ? (
            <video
              src={item.url}
              className="w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={item.caption || 'Locks Flow'} className="w-full object-cover" />
          )}
          {item.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-cream text-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform">
              {item.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Creer la page galerie (server component)**

```typescript
// app/gallery/page.tsx
import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import GalleryGrid from '@/components/GalleryGrid'
import Footer from '@/components/Footer'

export const metadata = { title: 'Galerie — Locks Flow' }
export const revalidate = 60

async function getMedia() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('media')
    .select('*')
    .order('order', { ascending: true })
  return data || []
}

export default async function GalleryPage() {
  const items = await getMedia()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080808] pt-[120px] pb-20 px-[50px]">
        <h1 className="font-unbounded text-[clamp(40px,6vw,80px)] leading-tight font-black uppercase text-cream mb-4">
          Le <span className="text-orange">Flow</span><br />en images.
        </h1>
        <p className="text-cream opacity-60 mb-16 text-lg">Les transformations parlent d&apos;elles-memes.</p>
        <GalleryGrid items={items} />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 3: Ajouter le lien Galerie dans la Navbar**

Dans `components/Navbar.tsx`, ajouter avant "Le Crew" :

```typescript
<li><Link href="/gallery" className="text-cream text-[13px] uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-orange transition-all">La Galerie</Link></li>
```

- [ ] **Step 4: Commit**

```bash
git add components/GalleryGrid.tsx app/gallery/ components/Navbar.tsx
git commit -m "feat: add gallery page with masonry grid"
```

---

### Task 12: Admin — Login

**Files:**
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Creer la page de login admin**

```typescript
// app/admin/login/page.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      router.push('/admin/bookings')
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="font-unbounded font-black text-2xl lowercase text-cream mb-12 text-center">
          locks<span className="text-orange">.</span>flow <span className="text-sm opacity-40">admin</span>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-transparent border border-white/20 text-cream p-4 outline-none focus:border-orange transition-colors"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-transparent border border-white/20 text-cream p-4 outline-none focus:border-orange transition-colors"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-orange text-black font-unbounded font-black py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/login/
git commit -m "feat: add admin login page with Supabase Auth"
```

---

### Task 13: Admin — Gestion des RDV

**Files:**
- Create: `app/admin/bookings/page.tsx`
- Create: `app/api/bookings/update/route.ts`

- [ ] **Step 1: Creer la page admin bookings**

```typescript
// app/admin/bookings/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Booking {
  id: string
  name: string
  phone: string
  service: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

const SERVICE_LABELS: Record<string, string> = {
  retwist: 'Retwist',
  depart: 'Depart',
  detartrage: 'Detartrage',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true })
    setBookings(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: 'confirmed' | 'cancelled') {
    await fetch('/api/bookings/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchBookings()
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) return <div className="min-h-screen bg-[#080808] flex items-center justify-center text-cream">Chargement...</div>

  return (
    <div className="min-h-screen bg-[#080808] p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <div className="font-unbounded font-black text-2xl lowercase text-cream">locks<span className="text-orange">.</span>flow</div>
          <div className="text-muted text-sm mt-1">Gestion des rendez-vous</div>
        </div>
        <div className="flex gap-4 items-center">
          <a href="/admin/media" className="text-cream opacity-60 hover:opacity-100 text-sm">Medias</a>
          <button onClick={logout} className="text-muted text-sm hover:text-cream">Deconnexion</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              {['Date','Heure','Client','Service','Telephone','Statut','Actions'].map(h => (
                <th key={h} className="text-left py-4 px-4 text-muted text-xs uppercase tracking-widest font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-4 px-4 text-cream text-sm">{format(new Date(b.date), 'dd MMM yyyy', { locale: fr })}</td>
                <td className="py-4 px-4 text-cream text-sm">{b.time}</td>
                <td className="py-4 px-4 text-cream font-medium">{b.name}</td>
                <td className="py-4 px-4 text-cream text-sm">{SERVICE_LABELS[b.service]}</td>
                <td className="py-4 px-4 text-cream text-sm">{b.phone}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status]}`}>
                    {b.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    {b.status !== 'confirmed' && (
                      <button
                        onClick={() => updateStatus(b.id, 'confirmed')}
                        className="text-green-400 text-xs hover:text-green-300 border border-green-400/30 px-3 py-1 rounded"
                      >
                        Confirmer
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        className="text-red-400 text-xs hover:text-red-300 border border-red-400/30 px-3 py-1 rounded"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="text-center py-20 text-muted">Aucun rendez-vous pour le moment.</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Creer la route PATCH pour le statut des RDV**

```typescript
// app/api/bookings/update/route.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest) {
  // Verifier que l'utilisateur est authentifie
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { id, status } = await req.json()

  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ status })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/bookings/ app/api/bookings/update/
git commit -m "feat: add admin bookings dashboard with confirm/cancel actions"
```

---

### Task 14: Admin — Upload Media

**Files:**
- Create: `app/admin/media/page.tsx`

- [ ] **Step 1: Creer la page admin media**

```typescript
// app/admin/media/page.tsx
'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface MediaItem {
  id: string
  url: string
  type: 'photo' | 'video'
  caption: string | null
}

export default function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { fetchMedia() }, [])

  async function fetchMedia() {
    const { data } = await supabase.from('media').select('*').order('order', { ascending: true })
    setItems(data || [])
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('caption', caption)

    await fetch('/api/media', { method: 'POST', body: formData })
    setCaption('')
    setUploading(false)
    fetchMedia()
  }

  async function handleDelete(id: string, url: string) {
    if (!confirm('Supprimer ce media ?')) return
    await fetch('/api/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, url }),
    })
    fetchMedia()
  }

  return (
    <div className="min-h-screen bg-[#080808] p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <div className="font-unbounded font-black text-2xl lowercase text-cream">locks<span className="text-orange">.</span>flow</div>
          <div className="text-muted text-sm mt-1">Gestion des medias</div>
        </div>
        <div className="flex gap-4 items-center">
          <a href="/admin/bookings" className="text-cream opacity-60 hover:opacity-100 text-sm">RDV</a>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login') }} className="text-muted text-sm hover:text-cream">Deconnexion</button>
        </div>
      </div>

      {/* Zone upload */}
      <div className="border border-white/20 p-8 mb-10">
        <h2 className="font-unbounded text-cream mb-6">Ajouter un media</h2>
        <div className="flex flex-col gap-4 max-w-md">
          <input
            type="text"
            placeholder="Legende (optionnel)"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="bg-transparent border border-white/20 text-cream p-3 outline-none focus:border-orange"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-orange text-black font-unbounded font-black py-4 hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? 'Upload en cours...' : 'Choisir une photo ou video'}
          </button>
        </div>
      </div>

      {/* Grille des medias */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="relative group">
            {item.type === 'video' ? (
              <video src={item.url} className="w-full h-48 object-cover" muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.caption || ''} className="w-full h-48 object-cover" />
            )}
            <button
              onClick={() => handleDelete(item.id, item.url)}
              className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Sup.
            </button>
            {item.caption && (
              <div className="text-muted text-xs mt-1 truncate">{item.caption}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/media/
git commit -m "feat: add admin media upload page"
```

---

## Chunk 5: Deploy

### Task 15: Deploy sur Vercel

- [ ] **Step 1: Pousser sur GitHub**

```bash
git remote add origin https://github.com/TON_USER/locksflow-site.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Connecter a Vercel**

1. Aller sur vercel.com
2. "Add New Project" > importer le repo GitHub
3. Framework: Next.js (auto-detecte)

- [ ] **Step 3: Ajouter les variables d'environnement dans Vercel**

Dans Vercel > Settings > Environment Variables, ajouter :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `OWNER_WHATSAPP`

- [ ] **Step 4: Deployer**

```bash
# Vercel deploie automatiquement depuis main
# Ou forcer :
npx vercel --prod
```

- [ ] **Step 5: Configurer le cron Vercel**

Le `vercel.json` configure deja le cron. Sur Vercel Pro le cron est natif. Sur le plan gratuit, utiliser un service externe comme cron-job.org pour appeler `/api/cron/reminders` chaque matin a 8h.

- [ ] **Step 6: Configurer WhatsApp Meta API**

1. Aller sur developers.facebook.com
2. Creer une app > WhatsApp Business
3. Ajouter ton numero de telephone
4. Soumettre les templates de message pour approbation Meta
5. Copier le Access Token et Phone Number ID dans les variables Vercel

---

> Projet complet : landing page fidele, reservations avec calendrier, notifications WhatsApp, galerie dynamique, admin protege.
