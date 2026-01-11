const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment variables...\n');

// Server .env content
const serverEnv = `# Server Environment Variables
PORT=5000
NODE_ENV=development

# MongoDB Database Connection
# For local MongoDB: mongodb://localhost:27017/placement-platform
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/placement-platform
MONGODB_URI=mongodb://localhost:27017/placement-platform

# JWT Configuration
# Generate a strong secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_EXPIRE=7d

# OpenAI API Key (Optional - for AI features)
# Get your key from: https://platform.openai.com/api-keys
# Leave empty if you don't have one (some features won't work)
OPENAI_API_KEY=

# Client/Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
`;

// Client .env content
const clientEnv = `# Client/Frontend Environment Variables
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api
`;

// Create server/.env
const serverEnvPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(serverEnvPath)) {
  fs.writeFileSync(serverEnvPath, serverEnv);
  console.log('✅ Created server/.env');
} else {
  console.log('⚠️  server/.env already exists - skipping');
}

// Create client/.env
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  fs.writeFileSync(clientEnvPath, clientEnv);
  console.log('✅ Created client/.env');
} else {
  console.log('⚠️  client/.env already exists - skipping');
}

console.log('\n✅ Environment setup complete!');
console.log('\n📝 Next steps:');
console.log('1. Edit server/.env and update MONGODB_URI if needed');
console.log('2. Edit server/.env and add OPENAI_API_KEY if you have one (optional)');
console.log('3. Generate a secure JWT_SECRET: openssl rand -base64 32');
console.log('4. Run: cd server && npm run seed (to create default users)');
console.log('5. Run: npm run dev (to start the application)');
console.log('\n📚 For detailed instructions, see ENV_SETUP_GUIDE.md\n');
