import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Simple CORS - allow everything for development
app.use(cors());
app.use(express.json());

console.log('🚀 Starting simple backend server...');

// Sample data
const pools = [
  { id: 1, name: "Ethereum Pool", token: "ETH", apy: 5.2, lockPeriod: 0, minStake: 0.1, maxStake: 1000 },
  { id: 2, name: "Bitcoin Pool", token: "BTC", apy: 4.8, lockPeriod: 30, minStake: 0.01, maxStake: 100 },
  { id: 3, name: "USDC Pool", token: "USDC", apy: 8.5, lockPeriod: 0, minStake: 100, maxStake: 50000 }
];

// Simple health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ success: true, data: { status: 'OK', message: 'Simple backend is working!' } });
});

// Get staking pools
app.get('/api/staking/pools', (req, res) => {
  console.log('📊 Staking pools requested');
  res.json({ success: true, data: pools });
});

// Catch all other routes
app.get('*', (req, res) => {
  console.log(`❓ Unknown route requested: ${req.path}`);
  res.json({ success: true, data: [], message: 'Endpoint not implemented yet' });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('🎉 SIMPLE BACKEND SERVER RUNNING! 🎉');
  console.log('========================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Pools: http://localhost:${PORT}/api/staking/pools`);
  console.log('========================================');
  console.log('');
});

export default app;
