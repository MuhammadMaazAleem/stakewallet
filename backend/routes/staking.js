import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import StakingPosition from '../models/StakingPosition.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

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

// GET /api/staking/pools - Get all staking pools with stats
router.get('/pools', async (req, res) => {
  try {
    // Define available staking pools
    const stakingPools = [
      {
        id: 1,
        name: "ETH Staking Pool",
        token: "ETH",
        apy: 8.5,
        lockPeriod: 0,
        minStake: 0.1,
        maxStake: 1000,
        description: "Flexible ETH staking with competitive rewards",
        risks: ["Smart contract risk", "Market volatility"],
        features: ["No lock period", "Compound rewards", "Instant unstaking"]
      },
      {
        id: 2,
        name: "USDC Stable Pool",
        token: "USDC",
        apy: 12.0,
        lockPeriod: 30,
        minStake: 100,
        maxStake: 50000,
        description: "High-yield stablecoin staking with 30-day lock",
        risks: ["Smart contract risk", "Depeg risk"],
        features: ["High APY", "Stable returns", "Auto-compound"]
      },
      {
        id: 3,
        name: "BTC Wrapped Pool",
        token: "WBTC",
        apy: 6.8,
        lockPeriod: 7,
        minStake: 0.01,
        maxStake: 10,
        description: "Bitcoin exposure with moderate lock period",
        risks: ["Smart contract risk", "Custodial risk", "Market volatility"],
        features: ["Bitcoin exposure", "Weekly rewards", "Flexible terms"]
      }
    ];

    // Get real stats for each pool
    const poolsWithStats = await Promise.all(
      stakingPools.map(async (pool) => {
        const stats = await StakingPosition.getPoolStats(pool.id);
        return {
          ...pool,
          stats: {
            totalValueLocked: stats.totalStaked || 0,
            totalStakers: stats.totalStakers || 0,
            averageStake: stats.avgStakeAmount || 0,
            totalRewardsPaid: stats.totalRewardsPaid || 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: poolsWithStats
    });
  } catch (error) {
    console.error('Error fetching staking pools:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staking pools'
    });
  }
});

// GET /api/staking/positions/:walletAddress - Get user's staking positions
router.get('/positions/:walletAddress', [
  param('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { status = 'active' } = req.query;

    const positions = await StakingPosition.find({
      walletAddress: walletAddress.toLowerCase(),
      ...(status !== 'all' && { status })
    }).sort({ createdAt: -1 });

    // Calculate current rewards for active positions
    const updatedPositions = positions.map(position => {
      if (position.status === 'active') {
        position.calculateRewards();
      }
      return position;
    });

    res.json({
      success: true,
      data: updatedPositions
    });
  } catch (error) {
    console.error('Error fetching staking positions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staking positions'
    });
  }
});

// POST /api/staking/stake - Create new staking position
router.post('/stake', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('poolId').isInt({ min: 1 }).withMessage('Invalid pool ID'),
  body('amount').isFloat({ min: 0.0001 }).withMessage('Amount must be greater than 0'),
  body('txHash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash'),
  body('tokenSymbol').isLength({ min: 1, max: 10 }).withMessage('Invalid token symbol')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress, poolId, amount, txHash, tokenSymbol, apy = 8.5 } = req.body;

    // Get or create user
    const user = await User.findOrCreateByWallet(walletAddress);

    // Create staking position
    const stakingPosition = new StakingPosition({
      user: user._id,
      walletAddress: walletAddress.toLowerCase(),
      poolId,
      poolName: `Pool ${poolId}`,
      tokenSymbol: tokenSymbol.toUpperCase(),
      amount,
      apy,
      transactions: {
        stake: {
          txHash,
          timestamp: new Date()
        }
      }
    });

    await stakingPosition.save();

    // Add to user's staking pools
    await user.addStakingPosition(stakingPosition._id);

    // Create transaction record
    await Transaction.createTransaction({
      userId: user._id,
      walletAddress,
      txHash,
      type: 'stake',
      amount,
      tokenSymbol,
      poolId,
      stakingPositionId: stakingPosition._id
    });

    res.status(201).json({
      success: true,
      data: stakingPosition
    });
  } catch (error) {
    console.error('Error creating staking position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create staking position'
    });
  }
});

// POST /api/staking/unstake/:positionId - Unstake position
router.post('/unstake/:positionId', [
  param('positionId').isMongoId().withMessage('Invalid position ID'),
  body('txHash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash'),
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')
], handleValidationErrors, async (req, res) => {
  try {
    const { positionId } = req.params;
    const { txHash, walletAddress } = req.body;

    const position = await StakingPosition.findOne({
      _id: positionId,
      walletAddress: walletAddress.toLowerCase(),
      status: 'active'
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Active staking position not found'
      });
    }

    // Update position status
    await position.unstake(txHash);

    // Create transaction record
    await Transaction.createTransaction({
      userId: position.user,
      walletAddress,
      txHash,
      type: 'unstake',
      amount: position.amount,
      tokenSymbol: position.tokenSymbol,
      poolId: position.poolId,
      stakingPositionId: position._id
    });

    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    console.error('Error unstaking position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unstake position'
    });
  }
});

// POST /api/staking/claim/:positionId - Claim rewards
router.post('/claim/:positionId', [
  param('positionId').isMongoId().withMessage('Invalid position ID'),
  body('txHash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash'),
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Invalid amount')
], handleValidationErrors, async (req, res) => {
  try {
    const { positionId } = req.params;
    const { txHash, walletAddress, amount } = req.body;

    const position = await StakingPosition.findOne({
      _id: positionId,
      walletAddress: walletAddress.toLowerCase(),
      status: 'active'
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Active staking position not found'
      });
    }

    // Calculate current rewards
    position.calculateRewards();
    
    const claimAmount = amount || position.rewards.pending;
    
    if (claimAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No rewards available to claim'
      });
    }

    // Claim rewards
    await position.claimRewards(txHash, claimAmount);

    // Create transaction record
    await Transaction.createTransaction({
      userId: position.user,
      walletAddress,
      txHash,
      type: 'claim_rewards',
      amount: claimAmount,
      tokenSymbol: position.tokenSymbol,
      poolId: position.poolId,
      stakingPositionId: position._id
    });

    res.json({
      success: true,
      data: {
        position,
        claimedAmount: claimAmount
      }
    });
  } catch (error) {
    console.error('Error claiming rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to claim rewards'
    });
  }
});

// GET /api/staking/stats/:walletAddress - Get user's staking statistics
router.get('/stats/:walletAddress', [
  param('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.json({
        success: true,
        data: {
          totalStaked: 0,
          totalRewards: 0,
          totalPending: 0,
          activePositions: 0,
          avgAPY: 0
        }
      });
    }

    const stats = await StakingPosition.getUserStats(user._id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching staking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staking statistics'
    });
  }
});

// PUT /api/staking/rewards/calculate - Calculate and update rewards for all active positions
router.put('/rewards/calculate', async (req, res) => {
  try {
    const activePositions = await StakingPosition.find({ status: 'active' });
    
    let updatedCount = 0;
    for (const position of activePositions) {
      const oldRewards = position.rewards.earned;
      position.calculateRewards();
      
      if (position.rewards.earned !== oldRewards) {
        await position.save();
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `Updated rewards for ${updatedCount} positions`,
      data: { updatedPositions: updatedCount }
    });
  } catch (error) {
    console.error('Error calculating rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate rewards'
    });
  }
});

export default router;
