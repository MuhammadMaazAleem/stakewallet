import { WalletState } from '../hooks/useWallet';

interface HeaderProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  activeTab: 'stake' | 'portfolio';
  setActiveTab: (tab: 'stake' | 'portfolio') => void;
}

const Header = ({ wallet, onConnect, onDisconnect, activeTab, setActiveTab }: HeaderProps) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum',
      5: 'Goerli',
      137: 'Polygon',
      80001: 'Mumbai'
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  return (
    <header className="flex justify-between items-center p-6 bg-black/30 backdrop-blur-md rounded-2xl border border-purple-500/20 glow">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Staking Protocol
        </h1>
      </div>

      {wallet.isConnected && (
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('stake')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'stake'
                ? 'bg-purple-600 text-white glow'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Stake
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'portfolio'
                ? 'bg-purple-600 text-white glow'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Portfolio
          </button>
        </nav>
      )}

      <div className="flex items-center space-x-4">
        {wallet.isConnected ? (
          <>
            <div className="text-right">
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-lg font-semibold text-white">{parseFloat(wallet.balance).toFixed(4)} ETH</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-gray-400">{getNetworkName(wallet.chainId)}</div>
                <div className="text-sm font-mono text-green-400">{formatAddress(wallet.address)}</div>
              </div>
              <button
                onClick={onDisconnect}
                className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onConnect}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all glow"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
