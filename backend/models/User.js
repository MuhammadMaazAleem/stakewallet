import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true
  },
  username: {
    type: String,
    sparse: true,
    trim: true
  },
  profile: {
    avatar: String,
    bio: String,
    twitter: String,
    discord: String
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    currency: { type: String, default: 'USD' }
  },
  stats: {
    totalStaked: { type: Number, default: 0 },
    totalRewards: { type: Number, default: 0 },
    stakingPools: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StakingPosition' }],
    joinedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ 'stats.totalStaked': -1 });
userSchema.index({ 'stats.joinedAt': -1 });
userSchema.index({ 'stats.lastActive': -1 });

// Virtual for user's total portfolio value
userSchema.virtual('portfolioValue').get(function() {
  return this.stats.totalStaked + this.stats.totalRewards;
});

// Hash sensitive data before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('email') && this.email) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error('Invalid email format');
    }
  }
  
  // Update last active timestamp
  this.stats.lastActive = new Date();
  next();
});

// Update last active on find
userSchema.pre(/^find/, function(next) {
  // Populate staking positions by default
  this.populate({
    path: 'stats.stakingPools',
    select: 'poolId amount rewards status createdAt'
  });
  next();
});

// Static method to find or create user by wallet address
userSchema.statics.findOrCreateByWallet = async function(walletAddress) {
  let user = await this.findOne({ walletAddress: walletAddress.toLowerCase() });
  
  if (!user) {
    user = await this.create({
      walletAddress: walletAddress.toLowerCase(),
      stats: {
        joinedAt: new Date(),
        lastActive: new Date()
      }
    });
  } else {
    // Update last active
    user.stats.lastActive = new Date();
    await user.save();
  }
  
  return user;
};

// Instance method to add staking position
userSchema.methods.addStakingPosition = async function(stakingPositionId) {
  if (!this.stats.stakingPools.includes(stakingPositionId)) {
    this.stats.stakingPools.push(stakingPositionId);
    await this.save();
  }
};

// Instance method to update stats
userSchema.methods.updateStats = async function(totalStaked, totalRewards) {
  this.stats.totalStaked = totalStaked || this.stats.totalStaked;
  this.stats.totalRewards = totalRewards || this.stats.totalRewards;
  this.stats.lastActive = new Date();
  await this.save();
};

export default mongoose.model('User', userSchema);
