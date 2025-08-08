import { WalletState } from '../hooks/useWallet';
import { useStaking } from '../hooks/useStaking';

interface PortfolioProps {
  wallet: WalletState;
}

const Portfolio = ({ wallet }: PortfolioProps) => {
  const { positions, isLoading, txPending, claimRewards, unstakeTokens } = useStaking(wallet);

  const totalStaked = positions.reduce((sum, pos) => sum + parseFloat(pos.stakedAmount), 0);
  const totalRewards = positions.reduce((sum, pos) => sum + parseFloat(pos.rewards), 0);

  const handleClaim = async (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (position) {
      await claimRewards(position.poolId);
    }
  };

  const handleUnstake = async (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (position) {
      await unstakeTokens(position.poolId, position.stakedAmount);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-600/20 text-blue-400';
      case 'unlocked':
        return 'bg-green-600/20 text-green-400';
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
          My Portfolio
        </h2>
        <p className="text-gray-400">Track your staking positions and rewards</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 glow">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">{positions.length}</div>
            <div className="text-gray-400">Active Positions</div>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 glow-green">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">{totalRewards.toFixed(4)}</div>
            <div className="text-gray-400">Total Rewards</div>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 glow">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">{totalStaked.toFixed(2)}</div>
            <div className="text-gray-400">Total Staked</div>
          </div>
        </div>
      </div>

      {/* Staking Positions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Staking Positions</h3>
        
        {positions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No active positions yet</div>
            <p className="text-gray-500">Start staking to see your positions here</p>
          </div>
        ) : (
          positions.map((position) => (
            <div
              key={position.id}
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${position.color} rounded-xl flex items-center justify-center text-white text-xl font-bold`}>
                    {position.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{position.poolName}</h4>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-400">APY: {position.apy}%</span>
                      <span className="text-sm text-gray-400">Lock: {position.lockPeriod} days</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(position.status)}`}>
                    {position.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Staked Amount</div>
                  <div className="text-lg font-semibold text-white">{position.stakedAmount}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Rewards Earned</div>
                  <div className="text-lg font-semibold text-green-400">{position.rewards}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Time Remaining</div>
                  <div className="text-lg font-semibold text-white">
                    {position.timeRemaining > 0 ? `${position.timeRemaining} days` : 'Unlocked'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Current Value</div>
                  <div className="text-lg font-semibold text-white">
                    {(parseFloat(position.stakedAmount) + parseFloat(position.rewards)).toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleClaim(position.id)}
                  disabled={parseFloat(position.rewards) === 0 || txPending}
                  className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {txPending ? 'Processing...' : 'Claim Rewards'}
                </button>
                <button
                  onClick={() => handleUnstake(position.id)}
                  disabled={position.status === 'active' || txPending}
                  className="flex-1 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {txPending ? 'Processing...' : 'Unstake'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Portfolio;
