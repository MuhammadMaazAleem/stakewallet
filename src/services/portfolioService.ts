import { apiClient } from './api';
import { StakingPosition } from './stakingService';
import { Transaction } from './transactionService';

// Types
export interface PortfolioData {
  totalValue: number;
  totalStaked: number;
  totalRewards: number;
  totalPending: number;
  positions: StakingPosition[];
  recentTransactions: Transaction[];
  portfolioDistribution: PoolDistribution[];
  performanceMetrics: PerformanceMetrics;
}

export interface PoolDistribution {
  poolId: number;
  poolName: string;
  amount: number;
  percentage: number;
  rewards: number;
  apy: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  avgAPY: number;
  bestPerformingPool: {
    poolId: number;
    poolName: string;
    totalStaked: number;
    totalRewards: number;
    apy: number;
  } | null;
  stakingDuration: number;
  activePositions: number;
  completedPositions: number;
}

export interface PortfolioHistory {
  period: string;
  history: HistoryDataPoint[];
  summary: {
    startValue: number;
    endValue: number;
    change: number;
    changePercent: number;
  };
}

export interface HistoryDataPoint {
  date: string;
  totalValue: number;
  totalStaked: number;
  totalRewards: number;
  timestamp: number;
}

export interface PortfolioAnalytics {
  riskMetrics: {
    diversificationScore: number;
    concentrationRisk: number;
    totalPools: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  rewardTrends: RewardTrend[];
  poolComparison: PoolComparison[];
  recommendations: Recommendation[];
  summary: {
    totalPositions: number;
    avgAPY: number;
    totalROI: number;
  };
}

export interface RewardTrend {
  date: string;
  amount: number;
  pool: number;
}

export interface PoolComparison {
  poolId: number;
  poolName: string;
  stakedAmount: number;
  percentage: number;
  apy: number;
  totalRewards: number;
  roi: number;
}

export interface Recommendation {
  type: 'risk' | 'diversification' | 'rewards' | 'optimization';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  action?: string;
}

// Portfolio API service
export const portfolioService = {
  // Get complete portfolio data
  async getPortfolio(walletAddress: string): Promise<PortfolioData> {
    return apiClient.get<PortfolioData>(`/portfolio/${walletAddress}`);
  },

  // Get portfolio value history
  async getHistory(
    walletAddress: string, 
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<PortfolioHistory> {
    return apiClient.get<PortfolioHistory>(`/portfolio/${walletAddress}/history?period=${period}`);
  },

  // Get detailed analytics
  async getAnalytics(walletAddress: string): Promise<PortfolioAnalytics> {
    return apiClient.get<PortfolioAnalytics>(`/portfolio/${walletAddress}/analytics`);
  },
};

// Helper functions
export const calculatePortfolioChange = (history: HistoryDataPoint[]): { change: number; changePercent: number; isPositive: boolean } => {
  if (history.length < 2) {
    return { change: 0, changePercent: 0, isPositive: true };
  }

  const start = history[0].totalValue;
  const end = history[history.length - 1].totalValue;
  const change = end - start;
  const changePercent = start > 0 ? (change / start) * 100 : 0;

  return {
    change,
    changePercent,
    isPositive: change >= 0,
  };
};

export const formatPortfolioValue = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
};

export const formatPercentage = (percentage: number, decimals: number = 2): string => {
  return `${percentage.toFixed(decimals)}%`;
};

export const getRiskLevelColor = (riskLevel: 'low' | 'medium' | 'high'): string => {
  switch (riskLevel) {
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const getRiskLevelBadgeColor = (riskLevel: 'low' | 'medium' | 'high'): string => {
  switch (riskLevel) {
    case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const getRecommendationIcon = (type: string): string => {
  switch (type) {
    case 'risk': return '⚠️';
    case 'diversification': return '📊';
    case 'rewards': return '💰';
    case 'optimization': return '🚀';
    default: return '💡';
  }
};

export const getRecommendationColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'high': return 'border-red-500/50 bg-red-500/10';
    case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
    case 'low': return 'border-blue-500/50 bg-blue-500/10';
    default: return 'border-gray-500/50 bg-gray-500/10';
  }
};

export const calculateDiversificationScore = (distribution: PoolDistribution[]): number => {
  if (distribution.length === 0) return 0;
  
  // Calculate Herfindahl index for concentration
  const herfindahl = distribution.reduce((sum, pool) => {
    const marketShare = pool.percentage / 100;
    return sum + (marketShare * marketShare);
  }, 0);
  
  // Convert to diversification score (0-100)
  const diversificationScore = (1 - herfindahl) * 100;
  
  // Adjust for number of pools
  const poolBonus = Math.min(distribution.length * 10, 30);
  
  return Math.min(diversificationScore + poolBonus, 100);
};

export const generatePortfolioInsights = (data: PortfolioData): string[] => {
  const insights: string[] = [];
  
  if (data.totalRewards > 0) {
    const roi = (data.totalRewards / data.totalStaked) * 100;
    if (roi > 10) {
      insights.push(`Excellent performance! Your portfolio has generated ${roi.toFixed(1)}% returns.`);
    } else if (roi > 5) {
      insights.push(`Good returns! You've earned ${roi.toFixed(1)}% on your staked assets.`);
    }
  }
  
  if (data.performanceMetrics.bestPerformingPool) {
    const best = data.performanceMetrics.bestPerformingPool;
    insights.push(`Your best performing pool is ${best.poolName} with ${best.apy}% APY.`);
  }
  
  if (data.totalPending > data.totalStaked * 0.01) {
    insights.push(`You have significant unclaimed rewards worth ${formatPortfolioValue(data.totalPending)}.`);
  }
  
  if (data.portfolioDistribution.length === 1) {
    insights.push('Consider diversifying across multiple pools to reduce risk.');
  }
  
  return insights;
};

export const getPortfolioHealthScore = (analytics: PortfolioAnalytics): { score: number; grade: string; color: string } => {
  const diversificationWeight = 0.3;
  const performanceWeight = 0.4;
  const riskWeight = 0.3;
  
  const diversificationScore = analytics.riskMetrics.diversificationScore;
  const performanceScore = Math.min(analytics.summary.totalROI * 10, 100);
  const riskScore = analytics.riskMetrics.riskLevel === 'low' ? 100 : 
                   analytics.riskMetrics.riskLevel === 'medium' ? 70 : 40;
  
  const totalScore = 
    (diversificationScore * diversificationWeight) +
    (performanceScore * performanceWeight) +
    (riskScore * riskWeight);
  
  let grade: string;
  let color: string;
  
  if (totalScore >= 90) {
    grade = 'A+';
    color = 'text-green-400';
  } else if (totalScore >= 80) {
    grade = 'A';
    color = 'text-green-400';
  } else if (totalScore >= 70) {
    grade = 'B';
    color = 'text-blue-400';
  } else if (totalScore >= 60) {
    grade = 'C';
    color = 'text-yellow-400';
  } else {
    grade = 'D';
    color = 'text-red-400';
  }
  
  return { score: Math.round(totalScore), grade, color };
};
