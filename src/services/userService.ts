import { apiClient } from './api';

// Types
export interface User {
  _id: string;
  walletAddress: string;
  email?: string;
  username?: string;
  profile: {
    avatar?: string;
    bio?: string;
    twitter?: string;
    discord?: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
    };
    theme: 'dark' | 'light';
    currency: string;
  };
  stats: {
    totalStaked: number;
    totalRewards: number;
    stakingPools: string[];
    joinedAt: string;
    lastActive: string;
  };
  verification: {
    isVerified: boolean;
    kycStatus: 'pending' | 'approved' | 'rejected';
  };
  portfolioValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardUser {
  rank: number;
  walletAddress: string;
  displayName: string;
  username?: string;
  totalStaked: number;
  totalRewards: number;
  joinedAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalStaked: number;
  totalRewards: number;
  avgStaked: number;
  newUsersLast30Days: number;
  activeUsersLast7Days: number;
}

// User API service
export const userService = {
  // Get or create user profile
  async getProfile(walletAddress: string): Promise<User> {
    return apiClient.get<User>(`/users/profile/${walletAddress}`);
  },

  // Update user profile
  async updateProfile(walletAddress: string, updates: Partial<User>): Promise<User> {
    return apiClient.put<User>(`/users/profile/${walletAddress}`, updates);
  },

  // Get leaderboard
  async getLeaderboard(limit: number = 10, page: number = 1): Promise<LeaderboardUser[]> {
    return apiClient.get<LeaderboardUser[]>(`/users/leaderboard?limit=${limit}&page=${page}`);
  },

  // Get platform statistics
  async getPlatformStats(): Promise<PlatformStats> {
    return apiClient.get<PlatformStats>('/users/stats');
  },

  // Update user activity
  async updateActivity(walletAddress: string): Promise<void> {
    return apiClient.post<void>(`/users/activity/${walletAddress}`);
  },
};

// Helper functions
export const formatWalletAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getUserDisplayName = (user: User): string => {
  return user.username || `User ${formatWalletAddress(user.walletAddress)}`;
};

export const calculateUserLevel = (totalStaked: number): { level: number; progress: number; nextLevelThreshold: number } => {
  const thresholds = [0, 100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000];
  let level = 1;
  
  for (let i = 0; i < thresholds.length; i++) {
    if (totalStaked >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  const currentThreshold = thresholds[level - 1] || 0;
  const nextThreshold = thresholds[level] || thresholds[thresholds.length - 1];
  const progress = nextThreshold > currentThreshold 
    ? ((totalStaked - currentThreshold) / (nextThreshold - currentThreshold)) * 100 
    : 100;
  
  return {
    level,
    progress: Math.min(progress, 100),
    nextLevelThreshold: nextThreshold
  };
};
