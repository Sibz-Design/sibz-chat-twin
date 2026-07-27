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

5. **Deploy Edge Functions**
   ```bash
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

1. **User Input Processing**: Messages are sent to the Supabase Edge Function (except quick actions and queries containing "project"/"badge"/"experience", which render visuals instantly)
2. **AI Generation**: Cohere AI processes the message using a system prompt describing Sibabalwe's skills, projects, and experience
3. **Streaming Response**: Real-time streaming of AI responses back to the frontend

### Key Components

- **Edge Function (`/supabase/functions/chat/index.ts`)**: Handles AI processing via Cohere
- **Streaming Interface**: Server-sent events for real-time conversation flow

## 💻 Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
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

#### 🎨 Using Lovable (Frontend Only)
1. Visit the [Lovable Project](https://lovable.dev/projects/e791dbaa-a198-4ab5-af65-ce3d52bb3615)
2. Make frontend changes through prompts
3. Changes sync automatically to the repository

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
│   ├── pages/                # Application pages
│   ├── hooks/                # Custom React hooks
│   └── utils/                # Utility functions
├── supabase/                  # Supabase configuration
│   ├── functions/            
│   │   ├── chat/             # AI chat Edge Function
│   │   └── send-email-function/ # Contact form Edge Function
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
- Use Cohere's Command-R-Plus model
- Maintain conversation context
- Provide responses as Sibabalwe's digital twin

## 🚢 Deployment

### Frontend Deployment (Lovable)
1. Open [Lovable](https://lovable.dev/projects/e791dbaa-a198-4ab5-af65-ce3d52bb3615)
2. Click **Share** → **Publish**
3. Your frontend will be deployed instantly

### Live Demo
- Deployed at [`sibz-chat-twin.vercel.app`](https://sibz-chat-twin.vercel.app/)

### Backend Deployment (Supabase)
1. Link your project to Supabase Cloud:
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. Deploy Edge Functions:
   ```bash
   supabase functions deploy chat
   ```

3. Configure CORS in the function responses (see Configuration above)

3. Set environment variables in Supabase Dashboard:
   - `COHERE_API_KEY`

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
- **[Lovable](https://lovable.dev/)** for the development platform
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
