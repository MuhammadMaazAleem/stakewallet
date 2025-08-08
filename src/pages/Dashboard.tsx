import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import StakingPools from '../components/StakingPools';
import Portfolio from '../components/Portfolio';
import WalletConnect from '../components/WalletConnect';
import { useWallet } from '../hooks/useWallet';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState<'stake' | 'portfolio'>('stake');

  const handleGoBack = () => {
    navigate('/');
  };

  const handleWalletConnect = async () => {
    await connectWallet();
  };

  const handleWalletDisconnect = () => {
    disconnectWallet();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 
                     border border-gray-600/30 rounded-lg text-gray-300 hover:text-white 
                     transition-all duration-200 backdrop-blur-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>

        <Header 
          wallet={wallet}
          onConnect={handleWalletConnect}
          onDisconnect={handleWalletDisconnect}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        {!wallet.isConnected ? (
          <WalletConnect 
            onConnect={handleWalletConnect}
            isConnecting={isConnecting}
          />
        ) : (
          <div className="mt-8">
            {activeTab === 'stake' ? (
              <StakingPools wallet={wallet} />
            ) : (
              <Portfolio wallet={wallet} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
