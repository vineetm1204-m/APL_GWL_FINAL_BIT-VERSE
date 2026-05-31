# 🏛️ GrievanceMap — Product Context

> **Tagline:** "Built for the city. Accountable to its people."  
> **Vision:** AI-powered Civic Intelligence Platform  
> **Target:** Hackathon MVP  

---

## 🎯 Core Philosophy & Mission

**GrievanceMap is not a complaint portal.** 

It is a next-generation **Civic Intelligence Platform** that transforms raw, unstructured citizen reports into actionable, hyper-localized civic data. By structuring real-time infrastructure data and analyzing it with advanced Gemini models, it gives both citizens and municipal authorities a highly accurate, live-updating look at city health.

The interface is built to replicate the clean, high-performance feel of modern startup hubs like **Linear**, **Notion**, **Stripe**, and **Uber Mission Control**, bringing high-end corporate efficiency to municipal governance.

---

## ⚡ Technical Stack

The architecture is built on a modern, high-performance frontend and a highly secure, serverless backend.

### Frontend
- **Framework & Build:** React 18 + Vite + TypeScript (fully type-safe)
- **Styling & Transitions:** TailwindCSS + Framer Motion (premium micro-animations and sleek dark mode)
- **State Management:** Zustand (decoupled stores with optimized reactivity)
- **Forms & Validation:** React Hook Form + Zod (comprehensive schema validation)
- **Spatial & Visuals:** Leaflet + OpenStreetMap (geospatial mapping) and Three.js + React Three Fiber (3D interactive analytics)

### Backend & Infrastructure
- **Authentication:** Firebase Authentication (role-based token resolution)
- **Database:** Firebase Firestore (real-time synchronized operational data store)
- **File Storage:** Firebase Storage (secure multimedia attachments)
- **AI/Serverless Layers:** Firebase Cloud Functions (protecting Gemini API keys and driving background ingestion pipelines)

### AI Engine
- **Gemini Flash (2.0):** Drives deep natural language extraction, sentiment scores, urgency indexing, and smart categorizations.
- **Gemini Vision (2.0):** Processes attached images to perform automated damage assessment, estimate severity indices, and flag inappropriate content.

---

## 🛡️ User Personas & Role Matrix

GrievanceMap supports a rich, multi-tenant permission matrix for all major civic stakeholders:

1. **Citizen:** The sensor network of the city. Submits detailed reports, uploads media, tracks resolutions, and upvotes urgent community concerns.
2. **Ward Officer:** The field commander. Oversees a specific ward, reviews incoming items, assigns tasks, and coordinates direct field responses.
3. **Field Worker:** The execution team. Receives specific assignments, updates statuses in real-time, and uploads proof-of-resolution directly from the site.
4. **Contractor:** Third-party execution teams assigned to heavy infrastructure or specialized engineering repairs.
5. **Journalist:** Public observers who monitor trending municipal issues, track historical SLA compliance, and report on regional development indices.
6. **Public Auditor:** Independent governance experts who trace audit trails, review historical timelines, and measure resource spending efficiency.
7. **GMC Admin (Gorakhpur Municipal Corporation / City Admin):** Oversees the city-wide department pipelines, reviews aggregate analytics, and re-allocates resources.
8. **Super Admin:** Platform owner managing system constants, ward boundaries, category configuration, AI model parameters, and user permissions.

---

## 💎 Design System & Aesthetic Principles

- **Mission Control Theme:** Curated deep-zinc dark theme with glassmorphic elements, sleek subtle gradients, and high-visibility neon accent status indicators.
- **Micro-Animations:** Fluid, spring-physics transitions on hovers, selections, page entries, and state updates to make the platform feel organic and alive.
- **Visual Grid:** Dense, high-information UI structure reminiscent of professional developer dashboards. No wasted white space; clean hierarchy, custom typography, and premium custom empty states.

---

## 🚫 Critical Constraints & Anti-Patterns

To maintain absolute production readiness and technical integrity:
- **No Mock Data:** Every user profile, category card, and ward scorecard must originate from a live Firestore query.
- **No Hardcoded Wards/Categories:** All municipal sectors and classification systems are dynamically driven by collection settings.
- **No Fake Analytics:** Health scores and trend lines must be calculated directly from database records or generated insights.
- **Complete Role Protection:** Route and document security are enforced strictly through middleware, custom guards, and Firestore rules.
