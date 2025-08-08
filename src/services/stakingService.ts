import { apiClient } from './api';

// Types
export interface StakingPool {
  id: number;
  name: string;
  token: string;
  apy: number;
  lockPeriod: number;
  minStake: number;
  maxStake: number;
  description: string;
  risks: string[];
  features: string[];
  stats: {
    totalValueLocked: number;
    totalStakers: number;
    averageStake: number;
    totalRewardsPaid: number;
  };
}

export interface StakingPosition {
  _id: string;
  user: string;
  walletAddress: string;
  poolId: number;
  poolName: string;
  tokenSymbol: string;
  amount: number;
  rewards: {
    earned: number;
    claimed: number;
    pending: number;
    lastCalculated: string;
  };
  apy: number;
  lockPeriod: number;
  status: 'active' | 'completed' | 'unstaking' | 'emergency_withdraw';
  transactions: {
    stake?: {
      txHash: string;
      blockNumber?: number;
      timestamp: string;
    };
    unstake?: {
      txHash: string;
      blockNumber?: number;
      timestamp: string;
    };
    lastRewardClaim?: {
      txHash: string;
      amount: number;
      timestamp: string;
    };
  };
  metadata: {
    network: string;
    contractAddress?: string;
    tokenAddress?: string;
    stakingStartDate: string;
    stakingEndDate?: string;
    autoCompound: boolean;
  };
  daysStaked: number;
  dailyRewards: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface StakingStats {
  totalStaked: number;
  totalRewards: number;
  totalPending: number;
  activePositions: number;
  avgAPY: number;
}

export interface StakeRequest {
  walletAddress: string;
  poolId: number;
  amount: number;
  txHash: string;
  tokenSymbol: string;
  apy?: number;
}

export interface UnstakeRequest {
  txHash: string;
  walletAddress: string;
}

export interface ClaimRequest {
  txHash: string;
  walletAddress: string;
  amount?: number;
}

// Staking API service
export const stakingService = {
  // Get all staking pools with statistics
  async getPools(): Promise<StakingPool[]> {
    return apiClient.get<StakingPool[]>('/staking/pools');
  },

  // Get user's staking positions
  async getPositions(walletAddress: string, status: string = 'active'): Promise<StakingPosition[]> {
    return apiClient.get<StakingPosition[]>(`/staking/positions/${walletAddress}?status=${status}`);
  },

  // Create new staking position
  async stake(request: StakeRequest): Promise<StakingPosition> {
    return apiClient.post<StakingPosition>('/staking/stake', request);
  },

  // Unstake position
  async unstake(positionId: string, request: UnstakeRequest): Promise<StakingPosition> {
    return apiClient.post<StakingPosition>(`/staking/unstake/${positionId}`, request);
  },

  // Claim rewards
  async claimRewards(positionId: string, request: ClaimRequest): Promise<{ position: StakingPosition; claimedAmount: number }> {
    return apiClient.post<{ position: StakingPosition; claimedAmount: number }>(`/staking/claim/${positionId}`, request);
  },

  // Get user's staking statistics
  async getStats(walletAddress: string): Promise<StakingStats> {
    return apiClient.get<StakingStats>(`/staking/stats/${walletAddress}`);
  },

  // Calculate and update rewards for all active positions
  async calculateRewards(): Promise<{ updatedPositions: number }> {
    return apiClient.put<{ updatedPositions: number }>('/staking/rewards/calculate');
  },
};

// Helper functions
export const formatTokenAmount = (amount: number, decimals: number = 4): string => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
};

export const formatAPY = (apy: number): string => {
  return `${apy.toFixed(1)}%`;
};

export const calculateEstimatedRewards = (amount: number, apy: number, days: number): number => {
  const dailyRate = apy / 100 / 365;
  return amount * dailyRate * days;
};

export const getPoolRiskLevel = (pool: StakingPool): 'low' | 'medium' | 'high' => {
  if (pool.apy <= 5) return 'low';
  if (pool.apy <= 10) return 'medium';
  return 'high';
};

export const getPoolColor = (poolId: number): string => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
  ];
  return colors[poolId % colors.length];
};

export const formatLockPeriod = (days: number): string => {
  if (days === 0) return 'No lock';
  if (days < 7) return `${days} day${days > 1 ? 's' : ''}`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''}`;
};

export const getTimeUntilUnlock = (stakingDate: string, lockPeriod: number): string | null => {
  if (lockPeriod === 0) return null;
  
  const stakeTime = new Date(stakingDate).getTime();
  const unlockTime = stakeTime + (lockPeriod * 24 * 60 * 60 * 1000);
  const now = Date.now();
  
  if (now >= unlockTime) return 'Unlocked';
  
  const remainingMs = unlockTime - now;
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  
  return formatLockPeriod(remainingDays);
};
