# NEU UniBot - Near East University Campus Assistant 🎓

AI-powered intelligent chatbot for Near East University students, providing instant answers about campus navigation, admissions, courses, and student services with interactive Google Maps integration.

![NEU UniBot](https://img.shields.io/badge/NEU-UniBot-red)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)
![React](https://img.shields.io/badge/react-18.2-blue)

## 🌟 Features

### Backend
- 🤖 **Free AI Integration** - Powered by Groq (Llama 3.3 70B Versatile)
- 🔍 **Smart Keyword Search** - Fast retrieval with intelligent scoring
- 🗺️ **Interactive Maps** - Embedded Google Maps with 23+ campus locations
- 📚 **Comprehensive NEU Data** - 20 faculties, 23+ locations, detailed information
- 🎯 **Context-Aware Responses** - Distinguishes location vs informational queries
- 🚀 **RESTful API** - Clean, documented endpoints
- ⚡ **No Vector Databases** - Simple JSON-based storage

### Frontend
- 💬 **Modern Chat Interface** - Real-time messaging with typing indicators
- 🗺️ **Map Cards** - Beautiful embedded Google Maps with "Open in Maps" button
- 🎨 **NEU-Branded Design** - Red color scheme matching university identity
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile
- 🌙 **Dark Mode** - Full dark theme support
- 💡 **Smart Suggestions** - Context-aware question recommendations per category
- 📍 **Copy Coordinates** - Quick coordinate copying for navigation
- ⏰ **Timestamps** - Full conversation history tracking
- 🔗 **Auto-Link Detection** - URLs automatically become clickable

## 📸 Key Features Showcase

### Interactive Map Cards
- Embedded Google Maps for 23+ campus locations
- "Open in Google Maps" button for mobile navigation
- Copy coordinates feature
- Beautiful card design with location details

### Smart Query Detection
- **Location queries** → Shows interactive map
  - "Where is the library?" ✅ Map
  - "Show me the dormitories" ✅ Map
- **Information queries** → Shows text response
  - "What are admission requirements?" ✅ Text
  - "Tell me about the Faculty of Engineering" ✅ Text

### Quick Actions
Three main categories for instant access:
- 📝 **Admissions** - Requirements, applications, fees, permits
- 🗺️ **Campus Map** - All buildings, facilities, and locations
- 🎯 **Student Life** - Services, clubs, activities, support

### Category Suggestions
Each category shows 5 relevant quick questions:
- No duplicate suggestions
- Reset after asking a question
- Easy topic switching

## 🏗️ Project Structure

```
UniBotProject/
├── unibot-backend/              # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/
│   │   │   └── chatController.js    # Message handling + validation
│   │   ├── services/
│   │   │   ├── aiService.js         # Groq AI + smart query detection
│   │   │   └── vectorService.js     # Keyword search + scoring
│   │   ├── routes/
│   │   │   └── chatRoutes.js        # API endpoints
│   │   ├── scripts/
│   │   │   ├── loadData.js          # Load university data
│   │   │   └── addMaptoData.js      # Generate map embeds
│   │   └── app.js                   # Express server
│   ├── data/
│   │   ├── university-info.json     # Source data (edit this)
│   │   └── vector_store.json        # Auto-generated search index
│   └── package.json
│
├── frontend/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx    # Main chat component
│   │   │   ├── MessageBubble.jsx    # Message + map rendering
│   │   │   ├── QuickActions.jsx     # Homepage categories
│   │   │   ├── QuickActionsCompact.jsx  # In-chat categories
│   │   │   ├── Header.jsx           # App header
│   │   │   └── DarkToggle.jsx       # Dark mode switch
│   │   ├── App.jsx                  # Main app + routing
│   │   └── main.jsx
│   └── package.json
│
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Groq API key (free at https://console.groq.com)

### Backend Setup

```bash
# Navigate to backend
cd unibot-backend

# Install dependencies
npm install

# Create .env file
echo "GROQ_API_KEY=your_groq_api_key_here
PORT=5000" > .env

# Load NEU data into search index
node src/scripts/loadData.js

# Start server
npm run dev
```

Backend runs on `http://localhost:5000`

**Expected output:**
```
Starting data load process...
Loaded 23 campus navigation items
Loaded 7 admission items
Loaded 20 courses
Loaded 8 general info items

✅ Data loading completed successfully!
📚 Total documents loaded: 58
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔑 Getting Your Groq API Key

1. Visit https://console.groq.com
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy and paste into `unibot-backend/.env`

**Free Tier Limits:**
- 30 requests per minute
- 14,400 requests per day
- Perfect for development and student use!

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api/chat
```

### Endpoints

#### Send Message
```http
POST /api/chat/message

Request:
{
  "message": "Where is the International Students Office?",
  "category": "campus-navigation"
}

Response (Map):
{
  "success": true,
  "data": {
    "type": "map",
    "message": "Located at Faculty of Communications 2nd Floor...",
    "title": "International Students Office",
    "embedUrl": "https://www.google.com/maps/embed?pb=...",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=...",
    "coordinates": "33.325172, 35.224087"
  }
}

Response (Text):
{
  "success": true,
  "data": {
    "type": "text",
    "message": "To apply to NEU, you need..."
  }
}
```

#### Health Check
```http
GET /health

Response:
{
  "status": "ok",
  "message": "University Chatbot API is running"
}
```

**Categories:**
- `general` - Student services, contact info, general questions
- `campus-navigation` - Buildings, facilities, locations (shows maps)
- `admissions` - Applications, requirements, fees, permits
- `courses` - Faculties, programs, departments

### Input Validation
All requests are validated:
- Message must be a non-empty string (max 1000 chars)
- Category must be one of the 4 valid categories
- Returns 400 Bad Request with clear error messages

## 📊 NEU Data Coverage

### Campus Navigation (23 locations with maps)
**Academic Buildings:**
- International Students Office (Faculty of Communications)
- Grand Library (24/7 during terms)
- 20 Faculty buildings with coordinates

**Student Facilities:**
- 12 Dormitories + Guest House
- Near East Olympic Swimming Pool
- Basketball Indoor Stadium
- Sports Complex

**Dining Options:**
- Pizza Pizza Restaurant
- Gusto Restaurant & Cafe
- NCS Kebap House
- Chicken House
- The Kaffo Coffee Shop
- Patisserie and Bakery Cafe

**Services & Amenities:**
- Post Office (Ground Floor, Economics Faculty)
- Near East Bank (2 branches)
- Ikas Supermarket
- Laundry Shop
- Cyprus Car Museum
- Cyprus Modern Art Museum
- NEU Event Park
- Ataturk Culture and Congress Center

### Faculties (20 total)
- Faculty of Engineering (Innovation Center)
- Faculty of Medicine (TIP Building)
- Faculty of AI and Informatics (Innovation Center)
- Faculty of Law, Pharmacy, Dentistry
- Faculty of Architecture, Communication
- Faculty of Arts & Sciences, Economics
- Faculty of Education, Health Sciences
- Faculty of Sports Sciences, Tourism
- And 10+ more with detailed department info

### Admissions Information
- Online application process (https://aday.neu.edu.tr)
- Accepted certificates (GCSE, IB, SAT, Tawjihi, WAEC, etc.)
- Student residence permit process
- Document translation requirements
- Tuition fees by program
- Registration freezing options

### Student Services
- Psychological Counseling Center
- Career Planning Unit
- Student Activities Center (clubs & societies)
- Disability Support Services
- Alumni Unit
- Petition System (academic, financial, housing)

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 16+
- **Framework:** Express.js 4.18
- **AI:** Groq (Llama 3.3 70B Versatile)
- **Search:** Custom keyword-based algorithm with scoring
- **Storage:** JSON file-based (no database needed)
- **API Design:** RESTful with proper error handling

### Frontend
- **Framework:** React 18.2
- **Build Tool:** Vite 4.x
- **Styling:** Tailwind CSS 3.x
- **State Management:** React Hooks
- **Router:** Browser History API
- **Components:** Custom, fully typed

### Key Libraries
- `groq-sdk` - AI completions
- `express` - Web server
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

## 🎨 Design System

**Color Scheme:**
- Primary Red: `#b91c1c` (NEU brand)
- Dark Red: `#991b1b` 
- Accent Blue: `#2563eb` (links, actions)
- Success Green: `#16a34a`
- Background: Gradient `from-gray-50 to-gray-100`
- Dark Mode: `from-gray-900 to-gray-800`

**Typography:**
- System font stack for performance
- Font sizes: xs (12px) to 5xl (48px)
- Font weights: normal, medium, semibold, bold

**Components:**
- Rounded corners: `rounded-xl` (12px)
- Shadows: `shadow-md` to `shadow-2xl`
- Transitions: 200-300ms ease
- Hover effects: Scale, translate, shadow

## 🧪 Testing

### Test Backend
```bash
cd unibot-backend

# 1. Health check
curl http://localhost:5000/health

# 2. Test location query (should return map)
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Where is the Grand Library?","category":"campus-navigation"}'

# 3. Test information query (should return text)
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the admission requirements?","category":"admissions"}'

# 4. Test validation (should return 400 error)
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"","category":"general"}'
```

### Test Frontend
1. Open `http://localhost:5173`
2. Test homepage quick actions
3. Test location queries:
   - "Where is the International Students Office?" → Should show map
   - "Show me the dormitories" → Should show map
4. Test information queries:
   - "What are admission requirements?" → Should show text
   - "Tell me about engineering programs" → Should show text
5. Test category suggestions:
   - Click "Admissions" → Shows 5 questions
   - Click "Admissions" again → No duplicate
   - Click a question → Sends query
6. Test dark mode toggle
7. Test on mobile (responsive)

## 📈 Performance

- **Backend Response:** 1-2 seconds (depends on Groq API)
- **Data Load Time:** < 5 seconds (58 documents)
- **Frontend Load:** < 1 second
- **Search Speed:** < 50ms (keyword-based)
- **Cost:** $0.00 (free tier)

## 🔐 Security

**Environment Variables:**
```bash
# unibot-backend/.env
GROQ_API_KEY=your_actual_key_here
PORT=5000
```

**Best Practices:**
- ✅ `.env` files in `.gitignore`
- ✅ Input validation on all endpoints
- ✅ CORS configured properly
- ✅ Rate limiting ready (commented in code)
- ✅ No API keys in frontend
- ⚠️ Regenerate keys if accidentally committed

## 🚀 Deployment

### Backend (Railway / Render / Heroku)
1. Connect GitHub repository
2. Set environment variables:
   - `GROQ_API_KEY` = your_key
   - `PORT` = 5000 (or auto-assigned)
3. Build command: `npm install`
4. Start command: `node src/app.js`
5. Deploy from `unibot-backend` directory

### Frontend (Vercel / Netlify)
1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Install command: `npm install`
3. Environment variables:
   - `VITE_API_URL` = your_backend_url
4. Update API_URL in `ChatInterface.jsx`:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/chat";
   ```

### Full Stack Docker
```dockerfile
# Coming soon - Docker Compose setup
docker-compose up
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if .env exists
ls -la unibot-backend/.env

# Verify Groq API key
cat unibot-backend/.env | grep GROQ_API_KEY

# Load data
cd unibot-backend
node src/scripts/loadData.js

# Check if vector_store.json was created
ls -la data/vector_store.json

# Try starting with verbose output
DEBUG=* npm run dev
```

**Development Guidelines:**
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before PR
- Update README if needed

## 📄 License

MIT License - see LICENSE file for details

## 👥 Authors

- **Carl** - Full Stack Development - [Carlm832](https://github.com/Carlm832)

## 🙏 Acknowledgments

- **Near East University** for institutional data and support
- **Groq** for providing free AI API access
- **Google Maps** for embedded map functionality
- **Open Source Community** for amazing tools and libraries

## 🗺️ Roadmap

**v1.0 (Current)**
- ✅ Smart AI responses with Groq
- ✅ Interactive Google Maps integration
- ✅ Category-based suggestions
- ✅ Dark mode support
- ✅ Mobile responsive design

## 📊 Stats

- **Total Lines of Code:** ~3,500
- **Components:** 8 React components
- **API Endpoints:** 2 main endpoints
- **Data Points:** 58 documents covering entire campus
- **Response Time:** < 2 seconds average
- **Accuracy:** High (uses official NEU data)
