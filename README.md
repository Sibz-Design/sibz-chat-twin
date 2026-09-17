# Sibz Chat Twin 🤖

Live demo: [`sibz-chat-twin.vercel.app`](https://sibz-chat-twin.vercel.app/)

An intelligent AI chatbot portfolio that serves as the digital twin of Sibabalwe Desemela. Built with React, TypeScript, and powered by Supabase Edge Functions and Cohere AI, this chatbot provides contextual responses about Sibabalwe's work, projects, and expertise based on a curated system prompt.

## ✨ Features

- **AI-Powered Conversations** - Intelligent responses powered by Cohere's Command-R-Plus model
- **Real-time Streaming** - Server-sent events for smooth, real-time chat experience
- **Visual Sections** - Projects and Certificates render as rich cards (no API call needed for quick actions or queries containing "project")
- **Polished Chat UI** - Linkified text, code blocks, copy-to-clipboard, sticky Home/Back bar
- **Contact & CTAs** - Certificates button (Google Drive) and Contact Me section with mailto fallback + LinkedIn
- **Modern UI/UX** - Clean, responsive design with shadcn/ui components
- **TypeScript Support** - Type-safe development throughout the stack
- **Supabase Backend** - Serverless functions and real-time capabilities

## 🛠️ Tech Stack

### Frontend
- **[React](https://reactjs.org/)** - Frontend library for building user interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Vite](https://vitejs.dev/)** - Next-generation frontend build tool
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable components built with Radix UI and Tailwind CSS
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Backend & AI
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service with Edge Functions
- **[Cohere AI](https://cohere.ai/)** - Large language model for natural conversations
- **[Deno](https://deno.land/)** - Runtime for Edge Functions

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- [Cohere API Key](https://dashboard.cohere.ai/)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sibz-Design/sibz-chat-twin.git
   cd sibz-chat-twin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   ```bash
   # Initialize Supabase (if not already done)
   supabase init

   # Start local Supabase instance
   supabase start
   ```

4. **Configure Environment Variables**
   
   Create a `.env.local` file in your project root:
   ```env
   # Cohere AI API Key (required)
   COHERE_API_KEY=your_cohere_api_key_here

   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Set the edge function secrets (see [Rate Limiting, Caching & Security](#-rate-limiting-caching--security) for the full list and defaults):
   ```bash
   supabase secrets set RATE_LIMIT_SALT=$(openssl rand -hex 32)
   supabase secrets set ALLOWED_ORIGINS=https://sibz-chat-twin.vercel.app,http://localhost:8080
   ```

5. **Apply database migrations, then deploy Edge Functions**
   ```bash
   # Creates the rate_limit_events / prompt_cache tables and RPCs
   supabase db push

   # Deploy the chat function to Supabase
   supabase functions deploy chat
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173` to start chatting with SibzAI!

## 🧠 How It Works

### AI Digital Twin Architecture

Every request goes to the Supabase Edge Function. The frontend holds no knowledge
about Siba and does no intent matching — it renders whatever the server returns.

1. **Intent classification** — `_shared/intent.ts` scores the message against
   weighted patterns. High-confidence questions ("what are his hobbies", "show me
   his projects") are answered directly from the profile data: no model call, no
   latency, no chance of a hallucinated detail.
2. **Model fallback** — anything ambiguous goes to Cohere with a system prompt
   generated from the same profile data, so the model and the cards can never
   disagree. The model appends a `[[cards: ...]]` directive, which the function
   strips and turns into typed card instructions.
3. **Response envelope** — every reply is `{ text, cards, followUps, source }`.
   The server decides *what* to show; the frontend decides *how* to render it.

### The profile knowledge base

`supabase/functions/_shared/profile/` is the single source of truth for
everything the portfolio knows about Siba. It is imported verbatim by both the
edge function (Deno) and the React frontend (via the `@profile` alias), so the
AI's answers and the visual cards always agree.

| File | Contains |
| --- | --- |
| `identity.ts` | Name, headline, location, avatar path, bio, links |
| `career.ts` | Roles and highlights |
| `skills.ts` | Skill groups |
| `projects.ts` | Project cards |
| `hobbies.ts` | Hobbies and personal interests, including photos and clips |
| `education.ts` | Education, certifications, badges |
| `goals.ts` | Professional goals, languages, off-limits topics |
| `suggestions.ts` | Conversation starters and follow-up chips |

**To add a hobby, project, or skill:** edit the relevant array. The system prompt,
the intent answers, and the visual cards all follow automatically — no chatbot
logic to touch. Run `npm run test:intent` afterwards.

Constraints these files must respect (they run under Deno as well as Vite):

- No React, no JSX, no `@/` alias imports, no bundler asset imports.
- Images are `public/` path strings (e.g. `/projects/foo.png`), not imports.
- Relative imports need an explicit `.ts` extension.
- **Everything here ships in the browser bundle — never put private data in it.**

### Hobby media

Each hobby can carry photos and clips, shown as a thumbnail strip that opens a
lightbox. Add them to the `media` array for that hobby:

```ts
media: [
  { kind: "image", src: "/hobbies/football/man-city-shirt.jpg",
    alt: "Siba wearing a Manchester City shirt", caption: "In the Man City shirt." },
  { kind: "video", src: "/hobbies/acting/short-film.mp4",
    poster: "/hobbies/acting/short-film-poster.jpg", alt: "Clip from the short film" },
  { kind: "embed", src: "https://www.youtube.com/embed/VIDEO_ID",
    alt: "The short film Siba acted in" },
]
```

Files go in `public/hobbies/<hobby-id>/` — see `public/hobbies/README.md` for the
expected filenames, how to generate a video poster frame, and when to host a
video externally instead of committing it. Anything that fails to load is
dropped from the gallery at runtime, so listing media before the file exists is
safe: the strip simply doesn't render.

Videos never autoplay, and `alt` text is required on every item.

### Profile photo

Drop a square photo at `public/profile/siba.jpg` and it appears on the profile
card whenever someone asks who Siba is. Until then the card falls back to the
existing portrait, so nothing breaks. To use a different filename, update
`avatar` in `identity.ts`.

### Key Components

- **Edge Function (`/supabase/functions/chat/index.ts`)** — orchestrates validation,
  rate limiting, intent classification, caching, and the Cohere call
- **`_shared/intent.ts`** — deterministic intent scoring
- **`_shared/answers.ts`** — deterministic replies composed from profile data
- **`_shared/prompt.ts`** — generates the system prompt; parses card directives
- **`src/lib/chatClient.ts`** — typed transport layer for the frontend
- **`src/components/chat/`** — card renderers (profile, hobbies, skills, contact,
  experience) plus the message, empty-state, and suggestion-chip components

## 💻 Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:intent` - Run the intent-classifier and profile checks
- `supabase start` - Start local Supabase instance
- `supabase functions serve` - Serve functions locally
- `supabase functions deploy chat` - Deploy chat function

### Local Development with Supabase

```bash
# Start Supabase services
supabase start

# Serve functions locally for development
supabase functions serve --env-file .env.local

# View Supabase Studio
# Navigate to: http://localhost:54323
```

### Development Workflows

#### 💻 Full Stack Local Development
1. Set up Supabase locally with `supabase start`
2. Configure environment variables
3. Deploy functions with `supabase functions deploy`
4. Run frontend with `npm run dev`

## 📁 Project Structure

```
sibz-chat-twin/
├── src/                        # React frontend application
│   ├── components/            # React components
│   │   └── chat/             # Chat cards, message rendering, empty state
│   ├── pages/                # Application pages
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # chatClient (transport), clientId, utils
│   └── utils/                # Utility functions
├── supabase/                  # Supabase configuration
│   ├── functions/            
│   │   ├── chat/             # AI chat Edge Function (rate-limited, cached, validated)
│   │   ├── send-email-function/ # Contact form Edge Function
│   │   └── _shared/          # Rate limiting, validation, cache, CORS, intent
│   │       └── profile/      # ⭐ Knowledge base — single source of truth,
│   │                         #    shared with the frontend via @profile
│   ├── migrations/            # Rate-limit + prompt-cache schema
│   ├── config.toml           # Supabase configuration
│   └── seed.sql              # Database seed data
├── package.json              # Frontend dependencies
└── README.md                 # This file
```

## 🔧 Configuration

### Supabase Configuration

The project uses Supabase for:
- **Edge Functions**: AI processing via Cohere
- **Real-time**: WebSocket connections for live chat
- **Authentication**: User management (if needed)
- **Database**: Chat history and user data storage

Key configuration in your Edge Function:
- Handle CORS preflight (OPTIONS) with 200/204 and include:
  - `Access-Control-Allow-Origin: http://localhost:5173` (or your deployed origin)
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: authorization, content-type, x-client-info, apikey`
  - Optionally `Access-Control-Max-Age: 86400`

### AI Configuration

The chatbot is configured to:
- Use Cohere's `command-r-08-2024` model
- Maintain conversation context (the last 8 turns are sent as history)
- Answer only from the profile knowledge base, never from general knowledge
- Provide responses as Sibabalwe's digital twin

## 🛡️ Rate Limiting, Caching & Security

The `chat` Edge Function is backed by a small, modular security layer split across
`supabase/functions/_shared/` so it can be reused by other functions later:

| Module | Responsibility |
| --- | --- |
| `_shared/identity.ts` | Builds a salted, hashed rate-limit key from the client ID (persisted in `localStorage`) + source IP — neither alone can be rotated to dodge limits, and the raw IP is never stored. |
| `_shared/rateLimiter.ts` | Calls the `check_and_record_rate_limit` Postgres RPC, which does an atomic 3-tier **sliding-window** check (10/min, 50/hour, 100/day by default) per identifier. |
| `_shared/validation.ts` | Input validation — message/history type checks, length limits, history item count limits. |
| `_shared/promptGuard.ts` | Heuristic prompt-injection scanner (blocks known jailbreak/override phrasing) — paired with delimiting the user's message in the system prompt so the model never treats it as instructions. |
| `_shared/cache.ts` | SHA-256 hashes the (stateless, first-turn) prompt and reads/writes `prompt_cache` to skip redundant Cohere calls for repeated questions. |
| `_shared/cors.ts` | Origin allow-list, configurable via `ALLOWED_ORIGINS`. |

Database side (`supabase/migrations/20260729120000_rate_limiting_and_prompt_cache.sql`):
- `rate_limit_events` — append-only log used for the sliding window; RLS-locked, only `service_role` can call the RPC.
- `prompt_cache` — hash → cached Cohere response + TTL.
- `cleanup_expired_records()` — deletes rows older than the widest window / past their TTL. Scheduled hourly via `pg_cron` (best-effort; enable the extension in **Supabase Dashboard → Database → Extensions** if the migration reports it couldn't schedule the job), with an opportunistic call from the edge function itself as a fallback.

On rate-limit rejection, the function returns **HTTP 429** with a `Retry-After` header and a JSON body (`retryAfter`, `limitedWindow`, per-window `limits`) that the frontend uses to render a live countdown and disable the input until it elapses (`src/pages/Chat.tsx`).

### Environment variables

All of these are Edge Function secrets (`supabase secrets set NAME=value`), not `VITE_*` frontend vars:

| Variable | Default | Purpose |
| --- | --- | --- |
| `COHERE_API_KEY` | — (required) | Cohere API key |
| `RATE_LIMIT_SALT` | dev fallback string | Salt used to hash the rate-limit identifier — **set a real random secret in production** |
| `RATE_LIMIT_PER_MINUTE` | `10` | Sliding-window request cap per minute |
| `RATE_LIMIT_PER_HOUR` | `50` | Sliding-window request cap per hour |
| `RATE_LIMIT_PER_DAY` | `100` | Sliding-window request cap per day |
| `MAX_MESSAGE_LENGTH` | `2000` | Max characters allowed in `message` |
| `MAX_HISTORY_ITEMS` | `20` | Max messages allowed in `history` |
| `MAX_HISTORY_ITEM_LENGTH` | `4000` | Max characters per history item |
| `MAX_BODY_BYTES` | `32000` | Max request body size (via `Content-Length`) |
| `CACHE_TTL_SECONDS` | `3600` | How long a cached response stays valid |
| `CLEANUP_SAMPLE_RATE` | `0.02` | Probability a request also triggers opportunistic DB cleanup |
| `ALLOWED_ORIGINS` | `https://sibz-chat-twin.vercel.app,http://localhost:8080` | Comma-separated CORS allow-list |

## 🚢 Deployment

### Frontend Deployment (Vercel)
1. Push to `main`. Vercel builds and deploys the branch automatically.
2. To deploy by hand instead, run `npm run build` and upload `dist/`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project's
   environment variables, otherwise the chat cannot reach its backend.

### Live Demo
- Deployed at [`sibz-chat-twin.vercel.app`](https://sibz-chat-twin.vercel.app/)

### Backend Deployment (Supabase)
1. Link your project to Supabase Cloud:
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. Push database migrations (creates the rate-limit/cache tables and RPCs):
   ```bash
   supabase db push
   ```

3. Deploy Edge Functions:
   ```bash
   supabase functions deploy chat
   ```

4. Configure CORS in the function responses (see Configuration above)

5. Set environment variables/secrets in Supabase Dashboard (or `supabase secrets set`):
   - `COHERE_API_KEY`
   - `RATE_LIMIT_SALT` (a real random secret — see [Rate Limiting, Caching & Security](#-rate-limiting-caching--security))
   - Optionally override `RATE_LIMIT_PER_MINUTE`, `RATE_LIMIT_PER_HOUR`, `RATE_LIMIT_PER_DAY`, `CACHE_TTL_SECONDS`, `ALLOWED_ORIGINS`, etc.

## 🤝 Contributing

We welcome contributions to improve SibzAI! Here's how:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
   - Frontend changes in `/src`
   - Backend/AI changes in `/supabase/functions`
4. **Test locally** with Supabase
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Test Edge Functions locally before deploying
- Ensure AI responses remain consistent with Sibabalwe's personality
- Keep frontend components modular and reusable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 About Sibabalwe Desemela

**IT Support Specialist & AI/ML Enthusiast**
- 🔧 **Current Focus**: Python, Flask, REST APIs, AI/ML, DevOps
- 🚀 **Projects**: Sentiment Dashboard, YouTube Comment Analytics Dashboard
- 💼 **GitHub**: [@Sibz-Design](https://github.com/Sibz-Design)
- 🔗 **LinkedIn**: [sibabalwe-desemela](https://linkedin.com/in/sibabalwe-desemela-554789253)

## 🙏 Acknowledgments

- **[Cohere AI](https://cohere.ai/)** for the powerful language model
- **[Supabase](https://supabase.com/)** for the excellent backend platform
- **[shadcn/ui](https://ui.shadcn.com/)** for the beautiful components

## 🆘 Support

Having issues or questions?

1. **Check the [Issues](https://github.com/Sibz-Design/sibz-chat-twin/issues)** page
2. **Create a new issue** with detailed information
3. **Join the discussion** in the repository

## 🔮 Future Enhancements

- Voice chat capabilities
- Multi-language support
- Enhanced GitHub repository analysis
- Integration with additional AI providers
- Chat history persistence
- Mobile app version

---

⭐ **Experience the future of AI-powered personal assistants!** Give this project a star if you find it interesting!
