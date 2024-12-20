import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';

const WalletConnection = () => {
    const { web3Service } = useContext(Web3Context);
    const [address, setAddress] = useState(null);
    const [networkName, setNetworkName] = useState('');

    useEffect(() => {
        const updateStatus = async () => {
            if (web3Service) {
                try {
                    const addr = await web3Service.getAddress();
                    setAddress(addr);
                    // Get network name from MetaMask
                    const network = await window.ethereum.request({ method: 'eth_chainId' });
                    setNetworkName(getNetworkName(network));
                } catch (error) {
                    console.error('Error getting wallet status:', error);
                    setAddress(null);
                }
            }
        };

        updateStatus();

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', updateStatus);
            window.ethereum.on('chainChanged', updateStatus);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', updateStatus);
                window.ethereum.removeListener('chainChanged', updateStatus);
            }
        };
    }, [web3Service]);

    const getNetworkName = (chainId) => {
        const networks = {
            '0x1': 'Ethereum Mainnet',
            '0x5': 'Goerli',
            '0xaa36a7': 'Sepolia',
            '0x539': 'Ganache'
        };
        return networks[chainId] || 'Unknown Network';
    };

    const formatAddress = (addr) => {
        if (!addr) return '';
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <div className="wallet-connection">
            {address ? (
                <div className="wallet-info">
                    <span className="network">{networkName}</span>
                    <span className="address">{formatAddress(address)}</span>
                    <div className="status connected">Connected</div>
                </div>
            ) : (
                <div className="wallet-info">
                    <div className="status disconnected">Please connect MetaMask</div>
                </div>
            )}
        </div>
    );
};

export default WalletConnection; 