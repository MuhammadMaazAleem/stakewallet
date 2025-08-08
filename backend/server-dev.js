import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory storage (for development without MongoDB)
let stakingPools = [
  {
    id: 1,
    name: "Ethereum Staking Pool",
    token: "ETH",
    apy: 5.2,
    lockPeriod: 0,
    minStake: 0.1,
    maxStake: 1000,
    description: "Secure Ethereum staking with competitive rewards",
    risks: ["Smart contract risk", "Market volatility"],
    features: ["No lock period", "Daily rewards", "Auto-compound"],
    stats: {
      totalValueLocked: 15420000,
      totalStakers: 8934,
      averageStake: 1.7,
      totalRewardsPaid: 892340
    }
  },
  {
    id: 2,
    name: "Bitcoin Yield Pool",
    token: "BTC",
    apy: 4.8,
    lockPeriod: 30,
    minStake: 0.01,
    maxStake: 100,
    description: "Bitcoin yield generation through DeFi protocols",
    risks: ["Protocol risk", "Bitcoin volatility"],
    features: ["High yield", "30-day lock", "Weekly rewards"],
    stats: {
      totalValueLocked: 89234000,
      totalStakers: 5621,
      averageStake: 15.9,
      totalRewardsPaid: 4234567
    }
  },
  {
    id: 3,
    name: "Stablecoin Safe Pool",
    token: "USDC",
    apy: 8.5,
    lockPeriod: 0,
    minStake: 100,
    maxStake: 50000,
    description: "Low-risk stablecoin staking with attractive yields",
    risks: ["Minimal risk", "Protocol risk"],
    features: ["High APY", "No lock", "Stable returns"],
    stats: {
      totalValueLocked: 23456000,
      totalStakers: 12456,
      averageStake: 1883,
      totalRewardsPaid: 1987654
    }
  }
];

let stakingPositions = [];
let users = [];
let transactions = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    data: {
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      message: 'Backend server is running without MongoDB (development mode)'
    }
  });
});

// Staking pool routes
app.get('/api/staking/pools', (req, res) => {
  res.json({
    success: true,
    data: stakingPools
  });
});

// User staking positions
app.get('/api/staking/positions/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const { status } = req.query;
  
  let userPositions = stakingPositions.filter(pos => pos.walletAddress === walletAddress);
  
  if (status) {
    userPositions = userPositions.filter(pos => pos.status === status);
  }
  
  res.json({
    success: true,
    data: userPositions
  });
});

// Create staking position
app.post('/api/staking/stake', (req, res) => {
  const { walletAddress, poolId, amount, txHash, tokenSymbol, apy } = req.body;
  
  const pool = stakingPools.find(p => p.id === poolId);
  if (!pool) {
    return res.status(404).json({
      success: false,
      message: 'Pool not found'
    });
  }
  
  const newPosition = {
    _id: Date.now().toString(),
    user: walletAddress,
    walletAddress,
    poolId,
    poolName: pool.name,
    tokenSymbol: tokenSymbol || pool.token,
    amount,
    rewards: {
      earned: 0,
      claimed: 0,
      pending: 0,
      lastCalculated: new Date().toISOString()
    },
    apy: apy || pool.apy,
    lockPeriod: pool.lockPeriod,
    status: 'active',
    transactions: {
      stake: {
        txHash,
        timestamp: new Date().toISOString()
      }
    },
    metadata: {
      network: 'ethereum',
      stakingStartDate: new Date().toISOString(),
      autoCompound: false
    },
    daysStaked: 0,
    dailyRewards: (amount * (apy || pool.apy) / 100) / 365,
    totalValue: amount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  stakingPositions.push(newPosition);
  
  res.json({
    success: true,
    data: newPosition
  });
});

// Get user staking statistics
app.get('/api/staking/stats/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const userPositions = stakingPositions.filter(pos => pos.walletAddress === walletAddress && pos.status === 'active');
  
  const stats = {
    totalStaked: userPositions.reduce((sum, pos) => sum + pos.amount, 0),
    totalRewards: userPositions.reduce((sum, pos) => sum + pos.rewards.earned, 0),
    totalPending: userPositions.reduce((sum, pos) => sum + pos.rewards.pending, 0),
    activePositions: userPositions.length,
    avgAPY: userPositions.length > 0 ? userPositions.reduce((sum, pos) => sum + pos.apy, 0) / userPositions.length : 0
  };
  
  res.json({
    success: true,
    data: stats
  });
});

// User routes
app.get('/api/users/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  let user = users.find(u => u.walletAddress === walletAddress);
  
  if (!user) {
    user = {
      _id: Date.now().toString(),
      walletAddress,
      joinedAt: new Date().toISOString(),
      totalStaked: 0,
      totalRewards: 0,
      activePositions: 0
    };
    users.push(user);
  }
  
  res.json({
    success: true,
    data: user
  });
});

// Portfolio routes
app.get('/api/portfolio/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const userPositions = stakingPositions.filter(pos => pos.walletAddress === walletAddress);
  
  const portfolio = {
    totalValue: userPositions.reduce((sum, pos) => sum + pos.totalValue, 0),
    totalRewards: userPositions.reduce((sum, pos) => sum + pos.rewards.earned, 0),
    positions: userPositions,
    performance: {
      daily: 0.05,
      weekly: 0.15,
      monthly: 0.82
    }
  };
  
  res.json({
    success: true,
    data: portfolio
  });
});

// Transaction routes
app.get('/api/transactions/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const userTransactions = transactions.filter(tx => tx.walletAddress === walletAddress);
  
  res.json({
    success: true,
    data: userTransactions
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API endpoint not found' 
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Running in DEVELOPMENT mode with in-memory storage`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
