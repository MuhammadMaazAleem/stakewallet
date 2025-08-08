import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  balance: string;
  chainId: number;
  provider: ethers.BrowserProvider | null;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: '',
    balance: '0',
    chainId: 0,
    provider: null,
  });

  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const network = await provider.getNetwork();
            const balance = await provider.getBalance(accounts[0].address);
            
            setWallet({
              isConnected: true,
              address: accounts[0].address,
              balance: ethers.formatEther(balance),
              chainId: Number(network.chainId),
              provider,
            });
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      setWallet({
        isConnected: true,
        address,
        balance: ethers.formatEther(balance),
        chainId: Number(network.chainId),
        provider,
      });

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: '',
      balance: '0',
      chainId: 0,
      provider: null,
    });
    toast.success('Wallet disconnected');
  };

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the chain hasn't been added to MetaMask
      if (error.code === 4902) {
        toast.error('Please add this network to your wallet');
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network');
      }
    }
  };

  return {
    wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };
};
