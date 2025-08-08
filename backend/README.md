# DApp Staking Platform Backend

A comprehensive Node.js backend for the DApp staking platform with MongoDB integration.

## 🚀 Features

- **RESTful API** with Express.js
- **MongoDB Integration** with Mongoose ODM
- **Real-time Data** for staking positions and rewards
- **Transaction Tracking** and analytics
- **User Management** with wallet authentication
- **Security Features** (rate limiting, CORS, helmet)
- **Error Handling** and validation
- **Performance Monitoring** and logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the environment variables:

```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/staking-dapp

# Frontend
FRONTEND_URL=http://localhost:5173

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Web3 Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY

# API Keys (Optional)
INFURA_PROJECT_ID=your_infura_project_id
ALCHEMY_API_KEY=your_alchemy_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Database will be created automatically

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI`

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Users
- `GET /users/profile/:walletAddress` - Get or create user profile
- `PUT /users/profile/:walletAddress` - Update user profile
- `GET /users/leaderboard` - Get top users by staking amount
- `GET /users/stats` - Get platform statistics
- `POST /users/activity/:walletAddress` - Update user activity

#### Staking
- `GET /staking/pools` - Get all staking pools with stats
- `GET /staking/positions/:walletAddress` - Get user's staking positions
- `POST /staking/stake` - Create new staking position
- `POST /staking/unstake/:positionId` - Unstake position
- `POST /staking/claim/:positionId` - Claim rewards
- `GET /staking/stats/:walletAddress` - Get user's staking statistics

#### Portfolio
- `GET /portfolio/:walletAddress` - Get complete portfolio data
- `GET /portfolio/:walletAddress/history` - Get portfolio value history
- `GET /portfolio/:walletAddress/analytics` - Get detailed analytics

#### Transactions
- `GET /transactions/:walletAddress` - Get user transaction history
- `GET /transactions/:walletAddress/summary` - Get transaction summary
- `GET /transactions/hash/:txHash` - Get transaction by hash
- `GET /transactions/stats/global` - Get global transaction statistics

#### Health Check
- `GET /health` - Server health status

## 🗃️ Database Schema

### Users Collection
```javascript
{
  walletAddress: String (unique, required),
  email: String (optional),
  username: String (optional),
  profile: {
    avatar: String,
    bio: String,
    twitter: String,
    discord: String
  },
  preferences: {
    notifications: { email: Boolean, push: Boolean },
    theme: String (dark/light),
    currency: String
  },
  stats: {
    totalStaked: Number,
    totalRewards: Number,
    stakingPools: [ObjectId],
    joinedAt: Date,
    lastActive: Date
  }
}
```

### Staking Positions Collection
```javascript
{
  user: ObjectId (ref: User),
  walletAddress: String (required),
  poolId: Number (required),
  poolName: String,
  tokenSymbol: String,
  amount: Number (required),
  rewards: {
    earned: Number,
    claimed: Number,
    pending: Number,
    lastCalculated: Date
  },
  apy: Number,
  status: String (active/completed/unstaking),
  transactions: {
    stake: { txHash: String, timestamp: Date },
    unstake: { txHash: String, timestamp: Date }
  }
}
```

### Transactions Collection
```javascript
{
  user: ObjectId (ref: User),
  walletAddress: String (required),
  txHash: String (unique, required),
  type: String (stake/unstake/claim_rewards),
  status: String (pending/confirmed/failed),
  amount: Number,
  tokenSymbol: String,
  poolId: Number,
  network: String,
  metadata: {
    contractAddress: String,
    timestamp: Date
  }
}
```

## 🔧 Configuration

### CORS Configuration
Update `server.js` to modify allowed origins:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Rate Limiting
Adjust rate limits in `server.js`:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## 📊 Monitoring & Logging

The server includes:
- **Morgan** for HTTP request logging
- **Error handling** middleware
- **Health check** endpoint
- **Performance metrics** in health endpoint

## 🔐 Security Features

- **Helmet** for security headers
- **Rate limiting** to prevent abuse
- **Input validation** with express-validator
- **Error sanitization** in production
- **CORS protection**

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/staking-dapp
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-production-jwt-secret
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Check API endpoints
curl http://localhost:5000/api/health
```

## 📝 Development Notes

1. **Auto-reload**: Use `npm run dev` for development with nodemon
2. **Database Indexes**: Indexes are automatically created for performance
3. **Validation**: All endpoints include input validation
4. **Error Handling**: Comprehensive error handling with user-friendly messages
5. **Pagination**: List endpoints support pagination
6. **Sorting**: Most endpoints support custom sorting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs in the console
