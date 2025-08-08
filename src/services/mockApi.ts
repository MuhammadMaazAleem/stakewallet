// Mock API client for offline/development mode
export const mockApiClient = {
  async get<T>(endpoint: string): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (endpoint.includes('/staking/pools')) {
      return [
        {
          id: 1,
          name: "Ethereum Staking Pool",
          token: "ETH",
          apy: 5.2,
          lockPeriod: 0,
          minStake: 0.1,
          maxStake: 1000,
          description: "Secure Ethereum staking with competitive rewards",
          risks: ["Smart contract risk", "Market volatility"],
          features: ["No lock period", "Daily rewards", "Auto-compound"],
          stats: {
            totalValueLocked: 15420000,
            totalStakers: 8934,
            averageStake: 1.7,
            totalRewardsPaid: 892340
          }
        },
        {
          id: 2,
          name: "Bitcoin Yield Pool",
          token: "BTC",
          apy: 4.8,
          lockPeriod: 30,
          minStake: 0.01,
          maxStake: 100,
          description: "Bitcoin yield generation through DeFi protocols",
          risks: ["Protocol risk", "Bitcoin volatility"],
          features: ["High yield", "30-day lock", "Weekly rewards"],
          stats: {
            totalValueLocked: 89234000,
            totalStakers: 5621,
            averageStake: 15.9,
            totalRewardsPaid: 4234567
          }
        },
        {
          id: 3,
          name: "Stablecoin Safe Pool",
          token: "USDC",
          apy: 8.5,
          lockPeriod: 0,
          minStake: 100,
          maxStake: 50000,
          description: "Low-risk stablecoin staking with attractive yields",
          risks: ["Minimal risk", "Protocol risk"],
          features: ["High APY", "No lock", "Stable returns"],
          stats: {
            totalValueLocked: 23456000,
            totalStakers: 12456,
            averageStake: 1883,
            totalRewardsPaid: 1987654
          }
        }
      ] as T;
    }
    
    if (endpoint.includes('/staking/positions/')) {
      return [
        {
          _id: "64f8a123456789abcdef0001",
          user: "user123",
          walletAddress: "0x742d35Cc6832C2532C3c8532",
          poolId: 1,
          poolName: "Ethereum Staking Pool",
          tokenSymbol: "ETH",
          amount: 2.5,
          rewards: {
            earned: 0.125,
            claimed: 0.075,
            pending: 0.05,
            lastCalculated: new Date().toISOString()
          },
          apy: 5.2,
          lockPeriod: 0,
          status: 'active' as const,
          transactions: {
            stake: {
              txHash: "0xabc123def456789...",
              timestamp: "2024-08-01T10:00:00Z"
            }
          },
          metadata: {
            network: "ethereum",
            stakingStartDate: "2024-08-01T10:00:00Z",
            autoCompound: true
          },
          daysStaked: 7,
          dailyRewards: 0.0178,
          totalValue: 2.625,
          createdAt: "2024-08-01T10:00:00Z",
          updatedAt: new Date().toISOString()
        }
      ] as T;
    }
    
    if (endpoint.includes('/staking/stats/')) {
      return {
        totalStaked: 5.75,
        totalRewards: 0.285,
        totalPending: 0.125,
        activePositions: 2,
        avgAPY: 6.1
      } as T;
    }
    
    // Default empty response
    return [] as T;
  },
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Mock operation completed" } as T;
  },
  
  async put<T>(endpoint: string, data?: any): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Mock update completed" } as T;
  },
  
  async delete<T>(endpoint: string): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Mock deletion completed" } as T;
  }
};
