🎬 CineTV --- AI-Powered Movie Discovery & Recommendation Platform

CineTV is a modern AI-powered movie discovery platform that helps users
find movies based on what they want to watch, how they feel, and their
preferences.

✨ Live Demo

https://cine-tv-frontend.vercel.app/

📦 Source Code

https://github.com/Tanyashri/CineTv

🚀 Features

🤖 AI Movie Recommendations --- Describe a mood, story, genre,
language, or viewing situation in natural language.

🧠 Emotion-Aware Recommendations --- Understands emotional
context and desired viewing mood.

🌍 Multilingual Discovery --- Supports movie discovery across
multiple languages rather than English-only recommendations.

🎭 Genre & Preference Filtering --- Combine genres, languages,
moods, themes, runtime and other preferences.

🎙️ Voice Input --- Describe what you want to watch using voice
input.

🎞️ Movie Trailers --- Retrieves movie videos through TMDb and
prioritizes official YouTube trailers/teasers.

📺 Where to Watch --- Displays available streaming providers
when reliable provider data is available.

🔍 Movie Discovery --- Explore trending, popular, top-rated,
upcoming, hidden-gem and international movies.

👤 User Profiles --- Manage profile information, favorites,
watched movies, recommendation history and preferences.

🌓 Dynamic Themes --- Responsive Dark/Light theme with adaptive
text, surfaces and accents.

✨ Modern Cinematic UI --- Responsive movie cards, animated
interactions and a cinema-focused interface.

🧠 Recommendation Flow

User Prompt
     ↓
Natural Language Understanding
     ↓
Emotion + Intent Detection
     ↓
Preference & Constraint Extraction
     ↓
Language / Genre / Theme Filtering
     ↓
TMDb Candidate Retrieval
     ↓
Recommendation Scoring & Ranking
     ↓
Recommendation Explanation
     ↓
Personalized Movie Cards

CineTV is designed to move beyond simple movie search:

Describe → Understand → Personalize → Recommend

🏗️ Architecture

┌─────────────────────────────────────────────┐
│              CineTV Frontend                │
│                                             │
│ React • TypeScript • Vite • Tailwind CSS    │
│                                             │
│ Home • Discover • Recommendations           │
│ Movie Details • Profile • Authentication    │
└──────────────────────┬──────────────────────┘
                       │ REST API
                       ▼
┌─────────────────────────────────────────────┐
│               CineTV Backend                │
│                                             │
│ Node.js • TypeScript • REST APIs • Docker   │
│                                             │
│ Recommendation Engine                       │
│ TMDb Integration                            │
│ Trailer Retrieval                           │
│ Watch Provider Retrieval                     │
│ AI / Emotion Processing                      │
└──────────────┬──────────────┬───────────────┘
               │              │
               ▼              ▼
             TMDb          Supabase
               │
               ▼
              AI

🛠️ Technology Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

Responsive UI components

Modern CSS animations

Backend

Node.js

TypeScript

REST APIs

Docker

AI & Recommendation

Natural-language prompt analysis

Emotion and intent extraction

Preference-aware recommendation

Recommendation scoring and ranking

AI-generated recommendation explanations

Services

TMDb --- Movie metadata, posters, genres and videos

YouTube --- Trailer playback

Supabase --- Authentication and user data

Vercel --- Frontend deployment

Render --- Backend deployment

🎞️ Trailer Flow

CineTV does not randomly search YouTube by movie title.

Movie TMDb ID
     ↓
TMDb Videos Endpoint
     ↓
Trailer Selection
     ↓
Verified YouTube Video Key
     ↓
YouTube Player / Modal

Official trailers are preferred, followed by official teasers when
appropriate. If a valid trailer is unavailable, the UI handles the
unavailable state instead of displaying a broken player.

👤 User Features

Authenticated users can manage:

Profile

Favorites

Watched movies

Recommendation history

Preferences

Account information

🔐 Security

Sensitive credentials should remain on the backend/server environment.

Do not expose or commit:

TMDb API keys

AI API keys

Database credentials

Authentication secrets

Other private environment variables

💻 Local Development

Clone

git clone https://github.com/Tanyashri/CineTv.git
cd CineTv

Frontend

cd frontend
npm install
npm run dev

Backend

cd ../backend
npm install
npm run dev

Configure the required environment variables using the project's
.env.example files.

📁 Project Structure

CineTv/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── .github/
├── docker-compose.yml
├── package.json
└── README.md

🌐 Deployment

Frontend --- Vercel

The frontend is deployed as a Vite application on Vercel.

Configure the production backend API URL through Vercel environment
variables.

Backend --- Render

The backend can be deployed as a Render Web Service using the backend
directory as the application root or through the included Docker
configuration.

The backend must listen on the deployment platform's assigned host/port.

🎯 Why CineTV?

Traditional movie platforms often follow:

Search → Filter → Select

CineTV aims for:

Describe → Understand → Personalize → Recommend

Users can describe how they feel or what kind of experience they want
without needing to know an exact movie title, genre or language.

🔮 Future Improvements

More advanced personalized recommendation models

Improved multilingual emotion detection

Long-term preference learning

More recommendation evaluation metrics

Additional streaming-provider integrations

Enhanced voice interaction

Context-aware recommendations

Improved cold-start personalization

⚠️ Disclaimer

CineTV relies on third-party services for movie metadata, trailers,
authentication and streaming-provider information. Availability may vary
by region and can change over time.

👩‍💻 Project

CineTV --- Intelligent Cinema Platform

An AI-powered movie discovery and recommendation platform combining
modern web development, movie APIs and intelligent recommendation
techniques.
