import { apiClient, PaginatedResponse } from './api';

// Types
export interface Transaction {
  _id: string;
  user: string;
  walletAddress: string;
  txHash: string;
  blockNumber?: number;
  type: 'stake' | 'unstake' | 'claim_rewards' | 'emergency_withdraw';
  status: 'pending' | 'confirmed' | 'failed';
  amount: number;
  tokenSymbol: string;
  poolId?: number;
  stakingPosition?: {
    _id: string;
    poolName: string;
    tokenSymbol: string;
    poolId: number;
  };
  network: string;
  gasUsed?: number;
  gasPrice?: string;
  gasFee?: number;
  metadata: {
    contractAddress?: string;
    methodName?: string;
    from?: string;
    to?: string;
    value?: string;
    nonce?: number;
    timestamp: string;
  };
  confirmations: number;
  error?: {
    message: string;
    code: string;
    reason: string;
  };
  age: string;
  usdValue?: number;
  createdAt: string;
  updatedAt: string;
  formattedAmount: string;
  shortTxHash: string;
  timeAgo: string;
  statusColor: 'yellow' | 'green' | 'red';
}

export interface TransactionSummary {
  period: string;
  overall: {
    totalTransactions: number;
    totalVolume: number;
    avgGasFee: number;
    successRate: number;
    recentActivity: number;
  };
  byType: {
    type: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
    successRate: number;
    pending: number;
    failed: number;
  }[];
  trends: {
    message: string;
  };
}

export interface GlobalTransactionStats {
  period: string;
  summary: {
    totalTransactions: number;
    totalVolume: number;
    uniqueUsers: number;
    avgTransactionSize: number;
    totalGasFees: number;
    successfulTxs: number;
    successRate: number;
  };
  volumeChart: {
    date: string;
    volume: number;
    transactions: number;
  }[];
}

export interface GetTransactionsOptions {
  page?: number;
  limit?: number;
  type?: 'stake' | 'unstake' | 'claim_rewards' | 'emergency_withdraw';
  status?: 'pending' | 'confirmed' | 'failed';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Transaction API service
export const transactionService = {
  // Get user transaction history
  async getTransactions(
    walletAddress: string, 
    options: GetTransactionsOptions = {}
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.type) params.append('type', options.type);
    if (options.status) params.append('status', options.status);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const queryString = params.toString();
    const url = `/transactions/${walletAddress}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PaginatedResponse<Transaction>>(url);
  },

  // Get transaction summary statistics
  async getSummary(
    walletAddress: string, 
    period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'
  ): Promise<TransactionSummary> {
    return apiClient.get<TransactionSummary>(`/transactions/${walletAddress}/summary?period=${period}`);
  },

  // Get transaction by hash
  async getByHash(txHash: string): Promise<Transaction & { explorerUrl: string }> {
    return apiClient.get<Transaction & { explorerUrl: string }>(`/transactions/hash/${txHash}`);
  },

  // Get global transaction statistics
  async getGlobalStats(period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'): Promise<GlobalTransactionStats> {
    return apiClient.get<GlobalTransactionStats>(`/transactions/stats/global?period=${period}`);
  },
};

// Helper functions
export const getTransactionTypeIcon = (type: string): string => {
  switch (type) {
    case 'stake': return '📈';
    case 'unstake': return '📉';
    case 'claim_rewards': return '💰';
    case 'emergency_withdraw': return '🚨';
    default: return '📄';
  }
};

export const getTransactionTypeLabel = (type: string): string => {
  switch (type) {
    case 'stake': return 'Stake';
    case 'unstake': return 'Unstake';
    case 'claim_rewards': return 'Claim Rewards';
    case 'emergency_withdraw': return 'Emergency Withdraw';
    default: return 'Unknown';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed': return 'text-green-400';
    case 'pending': return 'text-yellow-400';
    case 'failed': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const formatTransactionHash = (hash: string): string => {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

export const getExplorerUrl = (txHash: string, network: string = 'ethereum'): string => {
  const explorers = {
    ethereum: 'https://etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    bsc: 'https://bscscan.com/tx/',
  };
  
  const baseUrl = explorers[network as keyof typeof explorers] || explorers.ethereum;
  return `${baseUrl}${txHash}`;
};

export const calculateTransactionValue = (amount: number, tokenSymbol: string): string => {
  // This would typically use real-time price data
  // For now, return formatted amount with symbol
  return `${amount.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 6 
  })} ${tokenSymbol}`;
};

export const groupTransactionsByDate = (transactions: Transaction[]): Record<string, Transaction[]> => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
};
