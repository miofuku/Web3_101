import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import addresses from '../contracts/addresses.json';
import TravelNFTAbi from '../contracts/TravelNFT.json';
import TravelTokenAbi from '../contracts/TravelToken.json';
import TravelSBTAbi from '../contracts/TravelSBT.json';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [contracts, setContracts] = useState({});
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const init = async () => {
            const ethProvider = await detectEthereumProvider();
            if (ethProvider) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(provider);
            }
        };

        init();
    }, []);

    const connectWallet = async () => {
        try {
            if (!provider) {
                alert("Please install MetaMask!");
                return;
            }

            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            const signer = await provider.getSigner();
            setAccount(accounts[0]);
            setIsConnected(true);

            // Initialize contracts with signer
            const travelNFT = new ethers.Contract(
                addresses.TravelNFT,
                TravelNFTAbi,
                signer
            );

            const travelToken = new ethers.Contract(
                addresses.TravelToken,
                TravelTokenAbi,
                signer
            );

            const travelSBT = new ethers.Contract(
                addresses.TravelSBT,
                TravelSBTAbi,
                signer
            );

            setContracts({ travelNFT, travelToken, travelSBT });
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet!");
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setIsConnected(false);
        setContracts({});
    };

    return (
        <Web3Context.Provider value={{ 
            provider, 
            contracts, 
            account,
            isConnected,
            connectWallet,
            disconnectWallet
        }}>
            {children}
        </Web3Context.Provider>
    );
}; 