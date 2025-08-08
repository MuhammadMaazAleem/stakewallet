import express from 'express';
import { param, validationResult } from 'express-validator';
import StakingPosition from '../models/StakingPosition.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/portfolio/:walletAddress - Get complete portfolio data
router.get('/:walletAddress', [
  param('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Get user data
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.json({
        success: true,
        data: {
          totalValue: 0,
          totalStaked: 0,
          totalRewards: 0,
          totalPending: 0,
          positions: [],
          recentTransactions: [],
          performanceMetrics: {
            totalReturn: 0,
            avgAPY: 0,
            bestPerformingPool: null,
            stakingDuration: 0
          }
        }
      });
    }

    // Get all staking positions
    const positions = await StakingPosition.find({
      walletAddress: walletAddress.toLowerCase()
    }).sort({ createdAt: -1 });

    // Calculate current rewards for active positions
    let totalStaked = 0;
    let totalRewards = 0;
    let totalPending = 0;
    let weightedAPY = 0;
    let totalWeightedStake = 0;

    const updatedPositions = positions.map(position => {
      if (position.status === 'active') {
        position.calculateRewards();
        totalPending += position.rewards.pending;
        weightedAPY += position.apy * position.amount;
        totalWeightedStake += position.amount;
      }
      
      totalStaked += position.amount;
      totalRewards += position.rewards.earned;
      
      return position;
    });

    const avgAPY = totalWeightedStake > 0 ? weightedAPY / totalWeightedStake : 0;
    const totalValue = totalStaked + totalRewards;

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      walletAddress: walletAddress.toLowerCase()
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('stakingPosition', 'poolName')
    .lean();

    // Calculate performance metrics
    const firstPosition = positions.find(p => p.status === 'active');
    const stakingDuration = firstPosition 
      ? Math.floor((new Date() - firstPosition.createdAt) / (1000 * 60 * 60 * 24))
      : 0;

    // Find best performing pool
    const poolPerformance = {};
    positions.forEach(position => {
      if (!poolPerformance[position.poolId]) {
        poolPerformance[position.poolId] = {
          poolId: position.poolId,
          poolName: position.poolName,
          totalStaked: 0,
          totalRewards: 0,
          apy: position.apy
        };
      }
      poolPerformance[position.poolId].totalStaked += position.amount;
      poolPerformance[position.poolId].totalRewards += position.rewards.earned;
    });

    const bestPerformingPool = Object.values(poolPerformance)
      .sort((a, b) => (b.totalRewards / b.totalStaked) - (a.totalRewards / a.totalStaked))[0] || null;

    // Calculate total return percentage
    const totalReturn = totalStaked > 0 ? (totalRewards / totalStaked) * 100 : 0;

    // Portfolio distribution by pool
    const portfolioDistribution = Object.values(poolPerformance).map(pool => ({
      poolId: pool.poolId,
      poolName: pool.poolName,
      amount: pool.totalStaked,
      percentage: totalStaked > 0 ? (pool.totalStaked / totalStaked) * 100 : 0,
      rewards: pool.totalRewards,
      apy: pool.apy
    }));

    res.json({
      success: true,
      data: {
        totalValue,
        totalStaked,
        totalRewards,
        totalPending,
        positions: updatedPositions,
        recentTransactions,
        portfolioDistribution,
        performanceMetrics: {
          totalReturn,
          avgAPY,
          bestPerformingPool,
          stakingDuration,
          activePositions: positions.filter(p => p.status === 'active').length,
          completedPositions: positions.filter(p => p.status === 'completed').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio data'
    });
  }
});

// GET /api/portfolio/:walletAddress/history - Get portfolio value history
router.get('/:walletAddress/history', [
  param('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    let interval;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        interval = 3 * 24 * 60 * 60 * 1000; // 3 days
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        interval = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000;
    }

    // Get all transactions for the user in the period
    const transactions = await Transaction.find({
      walletAddress: walletAddress.toLowerCase(),
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Get all staking positions
    const positions = await StakingPosition.find({
      walletAddress: walletAddress.toLowerCase()
    });

    // Generate time series data
    const timePoints = [];
    const currentTime = startDate.getTime();
    const endTime = now.getTime();

    for (let time = currentTime; time <= endTime; time += interval) {
      timePoints.push(new Date(time));
    }

    // Calculate portfolio value at each time point
    const historyData = timePoints.map(timePoint => {
      let totalValue = 0;
      let totalStaked = 0;
      let totalRewards = 0;

      // Calculate portfolio state at this time point
      positions.forEach(position => {
        if (position.createdAt <= timePoint) {
          const daysSinceStaking = Math.max(0, (timePoint - position.createdAt) / (1000 * 60 * 60 * 24));
          const rewards = (position.amount * position.apy / 100 / 365) * daysSinceStaking;
          
          // Check if position was unstaked before this time
          const unstakeTime = position.transactions.unstake?.timestamp;
          if (!unstakeTime || unstakeTime > timePoint) {
            totalStaked += position.amount;
            totalRewards += Math.min(rewards, position.rewards.earned);
          }
        }
      });

      totalValue = totalStaked + totalRewards;

      return {
        date: timePoint.toISOString(),
        totalValue,
        totalStaked,
        totalRewards,
        timestamp: timePoint.getTime()
      };
    });

    res.json({
      success: true,
      data: {
        period,
        history: historyData,
        summary: {
          startValue: historyData[0]?.totalValue || 0,
          endValue: historyData[historyData.length - 1]?.totalValue || 0,
          change: historyData.length > 1 
            ? historyData[historyData.length - 1].totalValue - historyData[0].totalValue 
            : 0,
          changePercent: historyData.length > 1 && historyData[0].totalValue > 0
            ? ((historyData[historyData.length - 1].totalValue - historyData[0].totalValue) / historyData[0].totalValue) * 100
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio history'
    });
  }
});

// GET /api/portfolio/:walletAddress/analytics - Get detailed analytics
router.get('/:walletAddress/analytics', [
  param('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Get user and positions
    const [user, positions, transactions] = await Promise.all([
      User.findOne({ walletAddress: walletAddress.toLowerCase() }),
      StakingPosition.find({ walletAddress: walletAddress.toLowerCase() }),
      Transaction.find({ walletAddress: walletAddress.toLowerCase() }).sort({ createdAt: -1 })
    ]);

    if (!user) {
      return res.json({
        success: true,
        data: {
          riskMetrics: { diversificationScore: 0, concentrationRisk: 0 },
          rewardTrends: [],
          poolComparison: [],
          recommendations: []
        }
      });
    }

    // Calculate risk metrics
    const activePositions = positions.filter(p => p.status === 'active');
    const totalStaked = activePositions.reduce((sum, p) => sum + p.amount, 0);
    
    // Diversification score (based on number of pools and distribution)
    const poolCounts = {};
    activePositions.forEach(position => {
      poolCounts[position.poolId] = (poolCounts[position.poolId] || 0) + position.amount;
    });
    
    const numPools = Object.keys(poolCounts).length;
    const largestPoolPercentage = Math.max(...Object.values(poolCounts)) / totalStaked * 100;
    const diversificationScore = Math.min(100, (numPools * 20) * (1 - largestPoolPercentage / 100));
    
    // Concentration risk (percentage in largest position)
    const concentrationRisk = largestPoolPercentage;

    // Reward trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const rewardClaims = transactions.filter(tx => 
      tx.type === 'claim_rewards' && 
      tx.createdAt >= thirtyDaysAgo &&
      tx.status === 'confirmed'
    );

    const rewardTrends = rewardClaims.map(claim => ({
      date: claim.createdAt.toISOString().split('T')[0],
      amount: claim.amount,
      pool: claim.poolId
    }));

    // Pool comparison
    const poolComparison = Object.entries(poolCounts).map(([poolId, amount]) => {
      const poolPositions = activePositions.filter(p => p.poolId == poolId);
      const avgAPY = poolPositions.reduce((sum, p) => sum + p.apy, 0) / poolPositions.length;
      const totalRewards = poolPositions.reduce((sum, p) => sum + p.rewards.earned, 0);
      
      return {
        poolId: parseInt(poolId),
        poolName: poolPositions[0]?.poolName || `Pool ${poolId}`,
        stakedAmount: amount,
        percentage: (amount / totalStaked) * 100,
        apy: avgAPY,
        totalRewards,
        roi: amount > 0 ? (totalRewards / amount) * 100 : 0
      };
    }).sort((a, b) => b.stakedAmount - a.stakedAmount);

    // Generate recommendations
    const recommendations = [];
    
    if (concentrationRisk > 70) {
      recommendations.push({
        type: 'risk',
        title: 'High Concentration Risk',
        message: 'Consider diversifying across more pools to reduce risk',
        priority: 'high'
      });
    }
    
    if (numPools < 2 && totalStaked > 100) {
      recommendations.push({
        type: 'diversification',
        title: 'Diversify Your Portfolio',
        message: 'Stake in multiple pools to spread risk and maximize returns',
        priority: 'medium'
      });
    }
    
    if (activePositions.some(p => p.rewards.pending > p.amount * 0.01)) {
      recommendations.push({
        type: 'rewards',
        title: 'Unclaimed Rewards Available',
        message: 'You have significant unclaimed rewards. Consider claiming them.',
        priority: 'low'
      });
    }

    res.json({
      success: true,
      data: {
        riskMetrics: {
          diversificationScore: Math.round(diversificationScore),
          concentrationRisk: Math.round(concentrationRisk),
          totalPools: numPools,
          riskLevel: concentrationRisk > 70 ? 'high' : concentrationRisk > 40 ? 'medium' : 'low'
        },
        rewardTrends,
        poolComparison,
        recommendations,
        summary: {
          totalPositions: activePositions.length,
          avgAPY: poolComparison.reduce((sum, p) => sum + p.apy * p.percentage / 100, 0),
          totalROI: totalStaked > 0 ? (poolComparison.reduce((sum, p) => sum + p.totalRewards, 0) / totalStaked) * 100 : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio analytics'
    });
  }
});

export default router;
