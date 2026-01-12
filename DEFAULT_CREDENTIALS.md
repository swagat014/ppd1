# Default Login Credentials

This document contains the default login credentials for testing ZestPrep.

## 🚀 How to Create Default Users

Run the seed script to create default users:

```bash
cd server
npm run seed
```

Or from the root directory:
```bash
cd server && npm run seed
```

**Important:** MongoDB must be installed and running before executing the seed script.

---

## 📋 Default Login Credentials

### 👨‍🎓 Student Account
- **Email:** `student@example.com`
- **Password:** `student123`
- **Role:** Student
- **Profile:** John Doe, Computer Science, 3rd Year

### 👔 TPO (Training & Placement Officer) Account
- **Email:** `tpo@example.com`
- **Password:** `tpo123`
- **Role:** TPO
- **Profile:** Jane Smith, Training & Placement Department

### 👑 Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** Admin/Principal
- **Profile:** Admin User, Administration

### 👨‍🏫 Teacher Account
- **Email:** `teacher@example.com`
- **Password:** `teacher123`
- **Role:** Teacher
- **Profile:** Professor Johnson, Computer Science Department

---

## 🔐 How to Login

1. Start the application:
   ```bash
   npm run dev
   ```

2. Open your browser and go to: http://localhost:3000

3. You'll see the login page with tabs for different roles

4. Select the appropriate tab (Student, TPO, Admin, or Teacher)

5. Enter the email and password from the table above

6. Click "Login"

---

## ⚠️ Important Notes

- These are **default test credentials** for development purposes only
- **DO NOT use these credentials in production**
- Change all passwords before deploying to production
- The seed script will skip users that already exist (won't overwrite existing accounts)

## 🔄 Resetting Users

If you want to reset the default users:

1. Manually delete them from MongoDB:
   ```bash
   # Using MongoDB shell
   mongo placement-platform
   db.users.deleteMany({ email: { $in: ['student@example.com', 'tpo@example.com', 'admin@example.com', 'teacher@example.com'] } })
   ```

2. Or modify the seed script to clear existing users (uncomment the delete lines)

3. Run the seed script again:
   ```bash
   npm run seed
   ```

## 📝 Creating New Users

You can also create new users through:

1. **Registration API** (if enabled):
   ```bash
   POST http://localhost:5000/api/auth/register
   Body: {
     "email": "newuser@example.com",
     "password": "password123",
     "role": "student",
     "profile": {
       "firstName": "First",
       "lastName": "Last"
     }
   }
   ```

2. **Directly in MongoDB** (not recommended - passwords won't be hashed)

---

## 🆘 Troubleshooting

### Seed script fails
- Make sure MongoDB is running
- Check your `.env` file has correct `MONGODB_URI`
- Ensure you've installed all dependencies (`npm install`)

### Login fails
- Make sure the user was created successfully (check seed script output)
- Verify you're using the correct email and password
- Check browser console for errors
- Verify the backend server is running

### User already exists
- The seed script will skip existing users
- To recreate, delete the user first from MongoDB
- Or manually change the password in the database (remember to hash it with bcrypt)

---

**Remember:** These are test credentials. Always use strong, unique passwords in production!
