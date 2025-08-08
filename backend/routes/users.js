import express from 'express';
import { body, param, validationResult } from 'express-validator';
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

// GET /api/users/profile/:walletAddress - Get or create user profile
router.get('/profile/:walletAddress', [
  param('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const user = await User.findOrCreateByWallet(walletAddress);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// PUT /api/users/profile/:walletAddress - Update user profile
router.put('/profile/:walletAddress', [
  param('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('username').optional().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('profile.bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('preferences.theme').optional().isIn(['dark', 'light']).withMessage('Theme must be dark or light'),
  body('preferences.currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const updates = req.body;
    
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile'
    });
  }
});

// GET /api/users/leaderboard - Get top users by staking amount
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const users = await User.find({})
      .sort({ 'stats.totalStaked': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('walletAddress username profile.avatar stats.totalStaked stats.totalRewards stats.joinedAt')
      .lean();
    
    // Anonymize wallet addresses for privacy
    const anonymizedUsers = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
      walletAddress: user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4),
      displayName: user.username || `User ${user.walletAddress.slice(0, 6)}`
    }));
    
    res.json({
      success: true,
      data: anonymizedUsers
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// GET /api/users/stats - Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalStaked: { $sum: '$stats.totalStaked' },
          totalRewards: { $sum: '$stats.totalRewards' },
          avgStaked: { $avg: '$stats.totalStaked' }
        }
      }
    ]);
    
    const platformStats = stats[0] || {
      totalUsers: 0,
      totalStaked: 0,
      totalRewards: 0,
      avgStaked: 0
    };
    
    // Get new users in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({
      'stats.joinedAt': { $gte: thirtyDaysAgo }
    });
    
    // Get active users in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      'stats.lastActive': { $gte: sevenDaysAgo }
    });
    
    res.json({
      success: true,
      data: {
        ...platformStats,
        newUsersLast30Days: newUsers,
        activeUsersLast7Days: activeUsers
      }
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics'
    });
  }
});

// POST /api/users/activity/:walletAddress - Update user last active timestamp
router.post('/activity/:walletAddress', [
  param('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { 'stats.lastActive': new Date() }
    );
    
    res.json({
      success: true,
      message: 'Activity updated'
    });
  } catch (error) {
    console.error('Error updating user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity'
    });
  }
});

export default router;
