## Spandan - Real-Time Polling & Question Generation Platform
A production-ready real-time polling and question generation platform designed for classrooms and presentations. Teachers can create live quiz sessions, generate AI-powered questions from transcripts, and engage students with real-time leaderboards and response tracking.

## 🚀 Features
🔐 Authentication — JWT-based login with role-based access control (Teacher/Student)
🎯 Room Management — Create, join, and manage live polling sessions with unique room codes
❓ Question Types — Multiple Choice (MCQ), True/False (TF), and Multi-Select Questions (MSQ) with approval workflow
📊 Real-time Results — Live response tracking and leaderboards via Socket.IO
🎤 AI Question Generation — Transcript-based question generation using multiple AI providers (MiniMax, OpenAI, Anthropic, Google)
🌙 Theme Toggle — Dark and light mode support
📱 Responsive Design — Works across devices with dedicated teacher and student dashboards
⏱️ Time-Decay Scoring — Points calculated based on response speed (minimum 10% for correct answers)
## 🛠 Tech Stack
Layer	Technologies
Frontend	React 18, Vite, TailwindCSS, Zustand, Socket.IO Client, React Router
Backend	Node.js, Express, Socket.IO, MongoDB (Mongoose), JWT, bcryptjs
AI	Xenova Transformers (Whisper for transcription), Multiple AI Providers
Testing	Jest, Supertest, React Testing Library
Infrastructure	Nginx, systemd, PM2, Infisical (secrets management)
## 📁 Project Structure
spandan/  
├── frontend/              # React Vite application  
│   ├── src/  
│   │   ├── components/    # Reusable UI components  
│   │   ├── pages/         # Page components (AuthPage, StudentDashboard, etc.)  
│   │   ├── stores/        # Zustand state management (auth, socket, room)  
│   │   └── themes.css     # Theme styles  
│   └── package.json  
├── backend/               # Express API server  
│   ├── src/  
│   │   ├── models/        # Mongoose schemas (User, Room, Question, Response)  
│   │   ├── routes/        # API routes (auth, rooms, responses)  
│   │   ├── services/      # Business logic (question generation, room management)  
│   │   ├── middleware/    # Auth, validation, rate limiting  
│   │   └── index.js       # Entry point  
│   └── package.json  
├── nginx/                 # Nginx configuration for production  
├── .github/workflows/     # CI/CD pipelines  
├── server.js              # Production proxy server (port 5002)  
└── package.json           # Monorepo root configuration  
The project uses npm workspaces for unified dependency management across frontend and backend packages package.json:6-9 .

## 🏗 Request Flow
Client → HTTPS request to Nginx (port 443)
Nginx → Proxy pass to server.js (port 5002)
server.js → Route based on BASE_PATH:
/spandan/api/* → Proxy to backend (port 3001)
/spandan/socket.io/* → WebSocket proxy to backend
/spandan/assets/* → Serve static files from dist/
/spandan/* → SPA fallback (serve index.html)
🚦 Quick Start
Prerequisites
Node.js 20+
MongoDB 6.0+
npm or yarn
Installation
# Clone the repository  
git clone https://github.com/Abhijith2005binu/spandan.git  
cd spandan  
  
# Install all dependencies (root, frontend, backend)  
npm run install:all  
  
# Set up environment variables  
cp backend/.env.example backend/.env
Configuration
Edit backend/.env with your configuration:

PORT=3001  
NODE_ENV=development  
FRONTEND_URL=http://localhost:5173/spandan  
CORS_ORIGINS=http://localhost:5173,http://localhost:3001  
MONGODB_URI=mongodb://localhost:27017/spandan  
JWT_SECRET=your-super-secret-jwt-string-here  
  
## AI Provider API Keys (optional - for question generation)  
MINIMAX_API_KEY=  
OPENAI_API_KEY=  
ANTHROPIC_API_KEY=  
GOOGLE_API_KEY=  
  
## SMTP Email Configuration (for password reset)  
SMTP_EMAIL=your@gmail.com  
SMTP_PASSWORD=your-gmail-app-password
Development
## Run both frontend and backend in development mode  
npm run dev  
  
## Run frontend only  
npm run dev:frontend  
  
## Run backend only  
npm run dev:backend
Production Build
## Build frontend for production  
npm run build  
  
## Start production server  
node server.js
🧪 Testing
The project uses Jest for testing with separate suites for frontend and backend.

Running Tests
## Run all tests  
npm test  
  
## Run backend tests  
cd backend  
npm test  
  
## Run frontend tests  
cd frontend  
npm test  
  
## Run tests with coverage  
npm run test:coverage
Test Coverage
Backend: 72 tests passing, ~20% lines covered (logic tests only)
Frontend: 32 tests passing, ~20% lines covered (logic tests only)
Total: 104 tests TESTING_PIPELINE_LOG.md:242-248
CI/CD
The project uses GitHub Actions for continuous integration:

CI Workflow: Runs on every push/PR to main branch

Backend tests with coverage reporting
Frontend tests with coverage reporting
Uploads coverage to Codecov ci.yml:1-60
Deploy Workflow: Manual trigger for production deployment

SSH-based deployment to production server
Infisical secrets management
Automated frontend build and service restart deploy.yml:1-94
## 📡 API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/login	User login
POST	/api/auth/register	User registration
POST	/api/auth/reset-password	Password reset request
Rooms
Method	Endpoint	Description
GET	/api/rooms	List rooms (teacher)
POST	/api/rooms	Create room (teacher)
GET	/api/rooms/join/:code	Validate and join room (student)
GET	/api/rooms/:id	Get room details
Responses
Method	Endpoint	Description
POST	/api/responses	Submit poll response
GET	/api/responses/stats/student/:id	Get student statistics
GET	/api/responses/leaderboard/:roomId	Get room leaderboard
Health
Method	Endpoint	Description
GET	/api/health	Health check endpoint
## 🔌 Socket.IO Events
Client → Server
Event	Payload	Description
room:join	{ roomCode, userId }	Join a room session
response:submit	{ roomCode, questionId, studentId, selectedOption, responseTime }	Submit answer
Server → Client
Event	Payload	Description
room:joined	{ roomCode, userId, participants }	Room join confirmation
response:new	{ questionId, studentId, selectedOption, responseTime }	New response broadcast
leaderboard:updated	{ roomCode, leaderboard }	Leaderboard update
## 👥 User Roles
Role	Capabilities
Teacher	Create rooms, manage questions, approve AI-generated questions, view full results and analytics
Student	Join rooms via code, answer questions, view own history and limited leaderboard
## 🔒 Security Features
JWT Authentication — Stateless token-based authentication with configurable expiry
Password Hashing — bcryptjs for secure password storage
Rate Limiting — Configurable rate limits for API, auth, response, and leaderboard endpoints
CORS Protection — Configurable allowed origins
Helmet — Security headers for Express
Role-Based Access Control — Middleware to enforce teacher/student permissions
## 🚀 Deployment
Production Infrastructure
Web Server: Nginx (SSL/TLS via Let's Encrypt)
Process Management: systemd services (spandan-backend.service, spandan.service)
Database: MongoDB (production database: rohit_spandan)
Secrets Management: Infisical for environment variable orchestration
Proxy Layer: Custom Node.js proxy (server.js) for BASE_PATH handling
Deployment Steps
The deployment is automated via GitHub Actions:

SSH connection to production server
Pull latest code from repository
Authenticate with Infisical and export secrets
Build frontend application
Restart backend and proxy services
Reload Nginx configuration deploy.yml:23-94
## 📝 Development Workflow
Branch Strategy
main — Production branch
Feature branches — For new features
Bugfix branches — For bug fixes
Commit Convention
Use conventional commits:

feat: add new feature  
fix: fix bug  
docs: update documentation  
test: add tests  
refactor: refactor code  
## 🤝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'feat: add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
