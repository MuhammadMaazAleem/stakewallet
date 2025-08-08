import express from 'express';
import { param, query, validationResult } from 'express-validator';
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

// GET /api/transactions/:walletAddress - Get user transaction history
router.get('/:walletAddress', [
  param('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['stake', 'unstake', 'claim_rewards', 'emergency_withdraw']).withMessage('Invalid transaction type'),
  query('status').optional().isIn(['pending', 'confirmed', 'failed']).withMessage('Invalid transaction status')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const {
      page = 1,
      limit = 20,
      type,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { walletAddress: walletAddress.toLowerCase() };
    if (type) query.type = type;
    if (status) query.status = status;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('stakingPosition', 'poolName tokenSymbol poolId')
        .lean(),
      Transaction.countDocuments(query)
    ]);

    // Add formatted data for frontend
    const formattedTransactions = transactions.map(tx => ({
      ...tx,
      formattedAmount: tx.amount.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 6 
      }),
      shortTxHash: `${tx.txHash.slice(0, 10)}...${tx.txHash.slice(-8)}`,
      timeAgo: tx.age,
      statusColor: {
        pending: 'yellow',
        confirmed: 'green',
        failed: 'red'
      }[tx.status]
    }));

    res.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history'
    });
  }
});

// GET /api/transactions/:walletAddress/summary - Get transaction summary statistics
router.get('/:walletAddress/summary', [
  param('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Invalid period')
], handleValidationErrors, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { period = '30d' } = req.query;

    // Calculate date range
    let startDate;
    if (period !== 'all') {
      const now = new Date();
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[period];
      startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const matchQuery = { walletAddress: walletAddress.toLowerCase() };
    if (startDate) {
      matchQuery.createdAt = { $gte: startDate };
    }

    // Get transaction statistics
    const summary = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          confirmedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Calculate overall statistics
    const overallStats = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: '$amount' },
          avgGasFee: { $avg: '$gasFee' },
          successRate: {
            $avg: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await Transaction.find({
      walletAddress: walletAddress.toLowerCase(),
      createdAt: { $gte: sevenDaysAgo }
    }).countDocuments();

    // Format summary by transaction type
    const transactionTypes = ['stake', 'unstake', 'claim_rewards', 'emergency_withdraw'];
    const typeSummary = transactionTypes.map(type => {
      const typeData = summary.find(s => s._id === type) || {
        count: 0,
        totalAmount: 0,
        avgAmount: 0,
        confirmedCount: 0,
        pendingCount: 0,
        failedCount: 0
      };

      return {
        type,
        count: typeData.count,
        totalAmount: typeData.totalAmount,
        avgAmount: typeData.avgAmount || 0,
        successRate: typeData.count > 0 ? (typeData.confirmedCount / typeData.count) * 100 : 0,
        pending: typeData.pendingCount,
        failed: typeData.failedCount
      };
    });

    const overall = overallStats[0] || {
      totalTransactions: 0,
      totalVolume: 0,
      avgGasFee: 0,
      successRate: 0
    };

    res.json({
      success: true,
      data: {
        period,
        overall: {
          ...overall,
          successRate: Math.round(overall.successRate * 100),
          recentActivity
        },
        byType: typeSummary,
        trends: {
          // Could add daily/weekly trend analysis here
          message: 'Trend analysis available in future updates'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction summary'
    });
  }
});

// GET /api/transactions/hash/:txHash - Get transaction by hash
router.get('/hash/:txHash', [
  param('txHash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash')
], handleValidationErrors, async (req, res) => {
  try {
    const { txHash } = req.params;

    const transaction = await Transaction.findOne({ txHash })
      .populate('user', 'walletAddress username')
      .populate('stakingPosition', 'poolName tokenSymbol poolId amount apy');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...transaction.toObject(),
        explorerUrl: `https://etherscan.io/tx/${txHash}`,
        formattedAmount: transaction.amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6
        })
      }
    });
  } catch (error) {
    console.error('Error fetching transaction by hash:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction details'
    });
  }
});

// GET /api/transactions/stats/global - Get global transaction statistics
router.get('/stats/global', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    let startDate;
    if (period !== 'all') {
      const now = new Date();
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[period];
      startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const matchQuery = {};
    if (startDate) {
      matchQuery.createdAt = { $gte: startDate };
    }

    const globalStats = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: '$amount' },
          uniqueUsers: { $addToSet: '$walletAddress' },
          avgTransactionSize: { $avg: '$amount' },
          totalGasFees: { $sum: '$gasFee' },
          successfulTxs: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalTransactions: 1,
          totalVolume: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          avgTransactionSize: 1,
          totalGasFees: 1,
          successfulTxs: 1,
          successRate: {
            $multiply: [
              { $divide: ['$successfulTxs', '$totalTransactions'] },
              100
            ]
          }
        }
      }
    ]);

    // Get transaction volume by day for the period
    const volumeByDay = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          volume: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const stats = globalStats[0] || {
      totalTransactions: 0,
      totalVolume: 0,
      uniqueUsers: 0,
      avgTransactionSize: 0,
      totalGasFees: 0,
      successfulTxs: 0,
      successRate: 0
    };

    res.json({
      success: true,
      data: {
        period,
        summary: stats,
        volumeChart: volumeByDay.map(day => ({
          date: `${day._id.year}-${String(day._id.month).padStart(2, '0')}-${String(day._id.day).padStart(2, '0')}`,
          volume: day.volume,
          transactions: day.count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching global transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch global transaction statistics'
    });
  }
});

export default router;
