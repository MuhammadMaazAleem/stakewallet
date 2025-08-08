import { useState } from 'react';
import { WalletState } from '../hooks/useWallet';
import { useStaking } from '../hooks/useStaking';

interface StakingPool {
  id: string;
  name: string;
  apy: number;
  totalStaked: string;
  minStake: number;
  lockPeriod: string;
  icon: string;
  color: string;
}

interface StakingPoolsProps {
  wallet: WalletState;
}

const StakingPools = ({ wallet }: StakingPoolsProps) => {
  const { stakeTokens, txPending } = useStaking(wallet);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');

  const pools: StakingPool[] = [
    {
      id: 'eth-30',
      name: 'ETH Staking',
      apy: 5.2,
      totalStaked: '125,000',
      minStake: 0.1,
      lockPeriod: '30 days',
      icon: 'Ξ',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'eth-90',
      name: 'ETH Long Term',
      apy: 8.7,
      totalStaked: '89,500',
      minStake: 0.5,
      lockPeriod: '90 days',
      icon: 'Ξ',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'btc-60',
      name: 'BTC Staking',
      apy: 6.3,
      totalStaked: '45,200',
      minStake: 0.01,
      lockPeriod: '60 days',
      icon: '₿',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'matic-30',
      name: 'MATIC Pool',
      apy: 12.4,
      totalStaked: '2,500,000',
      minStake: 100,
      lockPeriod: '30 days',
      icon: '◈',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const handleStake = async (poolId: string) => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('Please enter a valid stake amount');
      return;
    }

    const pool = pools.find(p => p.id === poolId);
    if (!pool) return;

    if (parseFloat(stakeAmount) < pool.minStake) {
      alert(`Minimum stake amount is ${pool.minStake}`);
      return;
    }

    const poolIndex = pools.findIndex(p => p.id === poolId);
    await stakeTokens(poolIndex, stakeAmount);
    
    setStakeAmount('');
    setSelectedPool(null);
  };

  const setMaxBalance = () => {
    const balance = parseFloat(wallet.balance);
    const maxStake = Math.max(0, balance - 0.01); // Leave some ETH for gas
    setStakeAmount(maxStake.toString());
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Staking Pools
        </h2>
        <p className="text-gray-400">Choose a pool and start earning rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300 glow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${pool.color} rounded-xl flex items-center justify-center text-white text-xl font-bold`}>
                  {pool.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{pool.name}</h3>
                  <p className="text-gray-400 text-sm">Lock: {pool.lockPeriod}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">{pool.apy}%</div>
                <div className="text-sm text-gray-400">APY</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Staked</span>
                <span className="text-white font-medium">{pool.totalStaked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Min Stake</span>
                <span className="text-white font-medium">{pool.minStake}</span>
              </div>
            </div>

            {selectedPool === pool.id ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Amount to stake</span>
                    <button
                      onClick={setMaxBalance}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Max: {parseFloat(wallet.balance).toFixed(4)} ETH
                    </button>
                  </div>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder={`Min: ${pool.minStake}`}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStake(pool.id)}
                    disabled={txPending}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all glow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {txPending ? 'Processing...' : 'Stake Now'}
                  </button>
                  <button
                    onClick={() => setSelectedPool(null)}
                    disabled={txPending}
                    className="px-6 py-3 bg-gray-600/50 text-white rounded-lg hover:bg-gray-600/70 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSelectedPool(pool.id)}
                className="w-full py-3 bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                Select Pool
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakingPools;
