import mongoose from 'mongoose';

const stakingPositionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  poolId: {
    type: Number,
    required: true,
    index: true
  },
  poolName: {
    type: String,
    required: true
  },
  tokenSymbol: {
    type: String,
    required: true,
    uppercase: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  rewards: {
    earned: { type: Number, default: 0 },
    claimed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    lastCalculated: { type: Date, default: Date.now }
  },
  apy: {
    type: Number,
    required: true,
    min: 0,
    max: 1000
  },
  lockPeriod: {
    type: Number, // in days
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'unstaking', 'emergency_withdraw'],
    default: 'active',
    index: true
  },
  transactions: {
    stake: {
      txHash: String,
      blockNumber: Number,
      timestamp: Date
    },
    unstake: {
      txHash: String,
      blockNumber: Number,
      timestamp: Date
    },
    lastRewardClaim: {
      txHash: String,
      amount: Number,
      timestamp: Date
    }
  },
  metadata: {
    network: { type: String, default: 'ethereum' },
    contractAddress: String,
    tokenAddress: String,
    stakingStartDate: { type: Date, default: Date.now },
    stakingEndDate: Date,
    autoCompound: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
stakingPositionSchema.index({ user: 1, poolId: 1 });
stakingPositionSchema.index({ walletAddress: 1, status: 1 });
stakingPositionSchema.index({ poolId: 1, status: 1 });
stakingPositionSchema.index({ 'metadata.stakingEndDate': 1 });

// Virtual for days staked
stakingPositionSchema.virtual('daysStaked').get(function() {
  const start = this.metadata.stakingStartDate || this.createdAt;
  const now = new Date();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
});

// Virtual for estimated daily rewards
stakingPositionSchema.virtual('dailyRewards').get(function() {
  return (this.amount * this.apy / 100) / 365;
});

// Virtual for total value (staked + rewards)
stakingPositionSchema.virtual('totalValue').get(function() {
  return this.amount + this.rewards.earned;
});

// Pre-save middleware to calculate rewards
stakingPositionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('amount') || this.isModified('apy')) {
    this.calculateRewards();
  }
  next();
});

// Instance method to calculate current rewards
stakingPositionSchema.methods.calculateRewards = function() {
  if (this.status !== 'active') return;
  
  const now = new Date();
  const lastCalculated = this.rewards.lastCalculated || this.metadata.stakingStartDate || this.createdAt;
  const daysPassed = (now - lastCalculated) / (1000 * 60 * 60 * 24);
  
  if (daysPassed > 0) {
    const dailyReward = (this.amount * this.apy / 100) / 365;
    const newRewards = dailyReward * daysPassed;
    
    this.rewards.earned += newRewards;
    this.rewards.pending += newRewards;
    this.rewards.lastCalculated = now;
  }
};

// Instance method to claim rewards
stakingPositionSchema.methods.claimRewards = async function(txHash, amount) {
  this.rewards.claimed += amount || this.rewards.pending;
  this.rewards.pending = 0;
  this.transactions.lastRewardClaim = {
    txHash,
    amount: amount || this.rewards.pending,
    timestamp: new Date()
  };
  await this.save();
};

// Instance method to unstake
stakingPositionSchema.methods.unstake = async function(txHash) {
  this.status = 'unstaking';
  this.transactions.unstake = {
    txHash,
    blockNumber: null, // Will be updated when confirmed
    timestamp: new Date()
  };
  this.metadata.stakingEndDate = new Date();
  await this.save();
};

// Static method to get user's total staking stats
stakingPositionSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: userId, status: 'active' } },
    {
      $group: {
        _id: null,
        totalStaked: { $sum: '$amount' },
        totalRewards: { $sum: '$rewards.earned' },
        totalPending: { $sum: '$rewards.pending' },
        activePositions: { $sum: 1 },
        avgAPY: { $avg: '$apy' }
      }
    }
  ]);
  
  return stats[0] || {
    totalStaked: 0,
    totalRewards: 0,
    totalPending: 0,
    activePositions: 0,
    avgAPY: 0
  };
};

// Static method to get pool statistics
stakingPositionSchema.statics.getPoolStats = async function(poolId) {
  const stats = await this.aggregate([
    { $match: { poolId, status: 'active' } },
    {
      $group: {
        _id: null,
        totalStaked: { $sum: '$amount' },
        totalStakers: { $sum: 1 },
        avgStakeAmount: { $avg: '$amount' },
        totalRewardsPaid: { $sum: '$rewards.claimed' }
      }
    }
  ]);
  
  return stats[0] || {
    totalStaked: 0,
    totalStakers: 0,
    avgStakeAmount: 0,
    totalRewardsPaid: 0
  };
};

export default mongoose.model('StakingPosition', stakingPositionSchema);
