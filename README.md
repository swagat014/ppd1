# ZestPrep 🚀

A comprehensive web application designed to help students prepare for campus placements with advanced features including resume analysis, DSA practice, mock interviews, aptitude tests, and detailed analytics.

## 🌟 Key Features

### For Students:
- **Resume Analysis**: ATS-friendly checker with detailed improvement suggestions
- **DSA Practice**: Company-specific problems, pattern-based practice, and integrated code editor
- **Aptitude Practice**: Company-specific aptitude tests with detailed analytics
- **Mock Interviews**: AI-powered mock interviews with feedback and analysis
- **English Analysis**: Comprehensive English language assessment and improvement suggestions
- **Readiness Analyzer**: Complete assessment of placement readiness with actionable insights
- **Core Subjects**: Study materials and assessments for core CS subjects
- **Personal Dashboard**: Comprehensive analytics and progress tracking
- **Project Suggestions**: AI-powered project and skill recommendations

### For TPO (Training & Placement Officer):
- Student management and monitoring
- Placement analytics and statistics
- Company-specific insights
- Overall performance tracking

### For Teachers:
- Student progress monitoring
- Guidance and feedback tools
- Performance analytics

### For Admin/Principal:
- Complete system management
- User management (students, TPO, teachers)
- System-wide analytics
- Configuration management

## 🛠️ Tech Stack

### Frontend:
- React 18 with TypeScript
- Material-UI for components
- Monaco Editor for code editing
- Recharts for analytics visualization
- React Router for navigation
- Axios for API calls
- Socket.io for real-time features

### Backend:
- Node.js with Express and TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication
- OpenAI API for AI-powered features
- PDF parsing for resume analysis
- Natural language processing for analysis

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- OpenAI API key (optional - for AI features)

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Set Up Environment Variables

**Create `server/.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/placement-platform
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
OPENAI_API_KEY=your-openai-api-key-here
CLIENT_URL=http://localhost:3000
```

**Create `client/.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Quick setup:**
```bash
npm run setup-env
```

This will create both `.env` files with default values.

### Step 3: Set Up MongoDB

**Option A: Local MongoDB**
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB: `mongod`
3. Your `MONGODB_URI` in `.env` should be: `mongodb://localhost:27017/placement-platform`

**Option B: MongoDB Atlas (Cloud)**
1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create cluster and get connection string
3. Update `MONGODB_URI` in `server/.env` with your Atlas connection string

### Step 4: Create Default Users
```bash
cd server
npm run seed
```

This creates default users:
- Student: `student@example.com` / `student123`
- TPO: `tpo@example.com` / `tpo123`
- Admin: `admin@example.com` / `admin123`
- Teacher: `teacher@example.com` / `teacher123`

### Step 5: Run the Application
```bash
npm run dev
```

The app will run on:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Step 6: Login
1. Open http://localhost:3000
2. Select role tab (Student/TPO/Admin/Teacher)
3. Enter credentials (see DEFAULT_CREDENTIALS.md)
4. Click "Login"

## 🔐 User Roles

1. **Student**: Primary user with access to all learning and practice features
2. **TPO**: Training & Placement Officer with access to student analytics
3. **Teacher**: Access to student progress and guidance tools
4. **Admin**: Complete system administration access

## 📱 Features in Detail

### Authentication System
- Secure login with JWT tokens
- Role-based access control
- Password hashing with bcrypt
- Session management

### Resume Analysis
- Upload and parse PDF resumes
- ATS compatibility scoring
- Keyword analysis
- Improvement suggestions
- Project and skill recommendations

### DSA Practice
- 1000+ curated problems
- Company-specific problem sets (Google, Microsoft, Amazon, etc.)
- Pattern-based learning (Arrays, Trees, Graphs, DP, etc.)
- Integrated code editor with syntax highlighting
- Test case execution
- Progress tracking

### Aptitude Practice
- Quantitative aptitude
- Logical reasoning
- Verbal ability
- Company-specific test patterns
- Detailed performance analytics
- Weak area identification

### Mock Interviews
- AI-powered interview simulation
- Technical and HR rounds
- Real-time feedback
- Performance analysis
- Video recording (optional)
- Question bank by company

### English Analysis
- Grammar assessment
- Vocabulary analysis
- Pronunciation scoring (with audio input)
- Writing skill evaluation
- Improvement recommendations

### Student Readiness Analyzer
- Overall readiness score
- Detailed breakdown by category
- Comparison with peers
- Personalized study plan
- Timeline recommendations

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm run install-all`
3. Set up environment variables
4. Start the development server: `npm run dev`
5. Open http://localhost:3000 in your browser

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
