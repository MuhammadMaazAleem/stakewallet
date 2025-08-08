import { Wallet, Smartphone, Shield } from 'lucide-react';

interface WalletConnectProps {
  onConnect: () => void;
  isConnecting: boolean;
}

const WalletConnect = ({ onConnect, isConnecting }: WalletConnectProps) => {
  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Most popular wallet',
      icon: <Wallet className="w-6 h-6" />,
      color: 'hover:border-orange-500/50',
      bgColor: 'bg-orange-500'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      description: 'Scan with QR code',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'hover:border-blue-500/50',
      bgColor: 'bg-blue-500'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      description: 'Secure & easy to use',
      icon: <Shield className="w-6 h-6" />,
      color: 'hover:border-blue-600/50',
      bgColor: 'bg-blue-600'
    }
  ];

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 glow">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">S</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Connect Wallet
            </h2>
            <p className="text-gray-400">
              Connect your wallet to start staking and earning rewards
            </p>
          </div>

          <div className="space-y-4">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={onConnect}
                disabled={isConnecting}
                className={`w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/20 ${wallet.color} rounded-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${wallet.bgColor} rounded-lg flex items-center justify-center text-white`}>
                    {wallet.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">{wallet.name}</div>
                    <div className="text-gray-400 text-sm">{wallet.description}</div>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-white transition-colors">
                  {isConnecting ? '...' : '→'}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              By connecting a wallet, you agree to our Terms of Service
            </p>
          </div>

          {isConnecting && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 text-purple-400">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
