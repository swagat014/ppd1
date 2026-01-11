# Complete Setup Guide

## 📋 Quick Setup Steps

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Set Up Environment Variables
```bash
npm run setup-env
```

This creates:
- `server/.env` - Backend configuration
- `client/.env` - Frontend configuration

**Required in `server/.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/placement-platform
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
OPENAI_API_KEY=your-key-here (optional)
CLIENT_URL=http://localhost:3000
```

**Required in `client/.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**
1. Install: https://www.mongodb.com/try/download/community
2. Start: `mongod`
3. Use: `mongodb://localhost:27017/placement-platform`

**Option B: MongoDB Atlas (Cloud)**
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `server/.env`

### 4. Create Default Users
```bash
cd server
npm run seed
```

### 5. Start Application
```bash
npm run dev
```

Access at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 6. Login
See `DEFAULT_CREDENTIALS.md` for login credentials.

---

## 📝 Default Login Credentials

After running the seed script:

- **Student:** `student@example.com` / `student123`
- **TPO:** `tpo@example.com` / `tpo123`
- **Admin:** `admin@example.com` / `admin123`
- **Teacher:** `teacher@example.com` / `teacher123`

---

## ✅ Verification

1. Check MongoDB connection: Server console should show "MongoDB connected successfully"
2. Test backend: http://localhost:5000/api/health
3. Test login: Use credentials above at http://localhost:3000

---

For detailed information, see `IMPLEMENTATION_GUIDE.md` and `DEFAULT_CREDENTIALS.md`.
