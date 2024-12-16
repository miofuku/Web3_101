import React, { createContext, useState, useEffect, useRef } from 'react';
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
    const [isInitialized, setIsInitialized] = useState(false);
    const initializationCount = useRef(0);

    const initializeContracts = async (provider) => {
        try {
            if (initializationCount.current > 0) {
                return contracts;
            }
            
            initializationCount.current += 1;
            console.log('Initializing contracts with addresses:', addresses);

            const initializedContracts = {
                travelNFT: new ethers.Contract(
                    addresses.TravelNFT,
                    TravelNFTAbi,
                    provider
                ),
                travelToken: new ethers.Contract(
                    addresses.TravelToken,
                    TravelTokenAbi,
                    provider
                ),
                travelSBT: new ethers.Contract(
                    addresses.TravelSBT,
                    TravelSBTAbi,
                    provider
                )
            };

            await Promise.all([
                initializedContracts.travelNFT.getAddress(),
                initializedContracts.travelToken.getAddress(),
                initializedContracts.travelSBT.getAddress()
            ]);

            setContracts(initializedContracts);
            return initializedContracts;
        } catch (error) {
            console.error('Error initializing contracts:', error);
            throw error;
        }
    };

    useEffect(() => {
        const init = async () => {
            if (isInitialized) return;
            
            try {
                console.log('Initializing Web3Provider...');
                const readOnlyProvider = new ethers.JsonRpcProvider('http://localhost:7545');
                setProvider(readOnlyProvider);
                
                await initializeContracts(readOnlyProvider);
                setIsInitialized(true);
            } catch (error) {
                console.error('Error in Web3Provider initialization:', error);
            }
        };

        init();
    }, [isInitialized]);

    const connectWallet = async () => {
        try {
            const ethProvider = await detectEthereumProvider();
            if (!ethProvider) {
                alert("Please install MetaMask!");
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            const signer = await provider.getSigner();
            setAccount(accounts[0]);
            setIsConnected(true);

            // Update contracts with signer
            const initializedContracts = await initializeContracts(signer);
            if (initializedContracts) {
                setContracts(initializedContracts);
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet!");
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setIsConnected(false);
        // Reinitialize with read-only provider
        init();
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