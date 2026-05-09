## Islamic Reels & Quran Video Platform - MVP Build Plan

### Design System
- **Palette**: Deep emerald green (#0D7C66) as primary, warm gold (#C8A951) as accent, cream backgrounds, dark charcoal text
- **Font**: IBM Plex Sans Arabic (Google Fonts) for clean Arabic typography
- **Direction**: Full RTL with `dir="rtl"` on root
- **Style**: Calm, spiritual, premium SaaS feel with generous spacing and rounded corners

### Phase 1: Foundation
1. Design system setup (index.css, tailwind.config.ts, fonts)
2. RTL configuration in index.html
3. Enable Lovable Cloud for auth, database, storage

### Phase 2: Pages (Frontend-first)
1. **Landing Page** - Hero, features, how it works, pricing, FAQ, footer
2. **Login & Register Pages** - Arabic forms with validation
3. **Dashboard** - Sidebar layout, stats cards, recent projects
4. **My Projects** - Grid of project cards with actions
5. **Create New Project** - Structured form
6. **Editor Page** - Left panels + right preview area
7. **Export History** - Table with status badges
8. **Account Settings** - Profile form

### Phase 3: Backend
1. Database tables: projects, reciters, surahs, exports, media_assets
2. Seed data for reciters and surahs
3. Storage bucket for media uploads
4. RLS policies
5. Auth integration

### Architecture Notes
- Editor is a structured form-based workflow, not a drag-and-drop canvas
- Export is an async job (status tracking, future FFmpeg integration)
- All text in Arabic, all layouts RTL