import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
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
  txHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  blockNumber: {
    type: Number,
    index: true
  },
  type: {
    type: String,
    enum: ['stake', 'unstake', 'claim_rewards', 'emergency_withdraw'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  tokenSymbol: {
    type: String,
    required: true,
    uppercase: true
  },
  poolId: {
    type: Number,
    index: true
  },
  stakingPosition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StakingPosition'
  },
  network: {
    type: String,
    default: 'ethereum',
    index: true
  },
  gasUsed: Number,
  gasPrice: String,
  gasFee: Number,
  metadata: {
    contractAddress: String,
    methodName: String,
    from: String,
    to: String,
    value: String,
    nonce: Number,
    timestamp: Date
  },
  confirmations: {
    type: Number,
    default: 0
  },
  error: {
    message: String,
    code: String,
    reason: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ walletAddress: 1, status: 1 });
transactionSchema.index({ poolId: 1, type: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ 'metadata.timestamp': -1 });

// Virtual for USD value (if we have price data)
transactionSchema.virtual('usdValue').get(function() {
  // This would require integration with a price oracle
  // For now, return null - can be implemented later
  return null;
});

// Virtual for age of transaction
transactionSchema.virtual('age').get(function() {
  const now = new Date();
  const created = this.metadata.timestamp || this.createdAt;
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return 'Just now';
});

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  if (this.isNew && !this.metadata.timestamp) {
    this.metadata.timestamp = new Date();
  }
  next();
});

// Static method to create transaction record
transactionSchema.statics.createTransaction = async function(data) {
  const transaction = new this({
    user: data.userId,
    walletAddress: data.walletAddress.toLowerCase(),
    txHash: data.txHash,
    type: data.type,
    amount: data.amount,
    tokenSymbol: data.tokenSymbol.toUpperCase(),
    poolId: data.poolId,
    stakingPosition: data.stakingPositionId,
    network: data.network || 'ethereum',
    metadata: {
      contractAddress: data.contractAddress,
      methodName: data.methodName,
      from: data.from,
      to: data.to,
      value: data.value,
      nonce: data.nonce,
      timestamp: new Date()
    }
  });
  
  return await transaction.save();
};

// Instance method to confirm transaction
transactionSchema.methods.confirm = async function(blockNumber, gasUsed, gasPrice) {
  this.status = 'confirmed';
  this.blockNumber = blockNumber;
  this.gasUsed = gasUsed;
  this.gasPrice = gasPrice;
  this.confirmations = 1;
  
  // Calculate gas fee if gas data is provided
  if (gasUsed && gasPrice) {
    this.gasFee = parseFloat(gasUsed) * parseFloat(gasPrice) / 1e18; // Convert to ETH
  }
  
  await this.save();
};

// Instance method to mark as failed
transactionSchema.methods.fail = async function(error) {
  this.status = 'failed';
  this.error = {
    message: error.message,
    code: error.code,
    reason: error.reason
  };
  await this.save();
};

// Static method to get user transaction history
transactionSchema.statics.getUserHistory = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type = null,
    status = null,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const query = { user: userId };
  if (type) query.type = type;
  if (status) query.status = status;
  
  const sort = { [sortBy]: sortOrder };
  const skip = (page - 1) * limit;
  
  const [transactions, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('stakingPosition', 'poolName tokenSymbol')
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    transactions,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

// Static method to get transaction statistics
transactionSchema.statics.getStats = async function(timeRange = '30d') {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const stats = await this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        successRate: {
          $avg: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats;
};

export default mongoose.model('Transaction', transactionSchema);
