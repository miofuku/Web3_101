import React, { createContext, useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import addresses from '../contracts/addresses.json';
import TravelNFTAbi from '../contracts/TravelNFT.json';
import TravelTokenAbi from '../contracts/TravelToken.json';
import TravelSBTAbi from '../contracts/TravelSBT.json';

export const Web3Context = createContext();

// Default Ganache account (first account)
const DEFAULT_ACCOUNT = '0xE4109f787245469CDb5b1EC4aAe2198a03873c9F';

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [contracts, setContracts] = useState({});
    const [account, setAccount] = useState(DEFAULT_ACCOUNT); // Set default account
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

            // Get the default signer from Ganache
            const signer = await provider.getSigner(DEFAULT_ACCOUNT);

            const initializedContracts = {
                travelNFT: new ethers.Contract(
                    addresses.TravelNFT,
                    TravelNFTAbi,
                    signer  // Use signer instead of provider for write operations
                ),
                travelToken: new ethers.Contract(
                    addresses.TravelToken,
                    TravelTokenAbi,
                    signer
                ),
                travelSBT: new ethers.Contract(
                    addresses.TravelSBT,
                    TravelSBTAbi,
                    signer
                )
            };

            // Verify contracts are initialized
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

            // Update contracts with new signer
            const initializedContracts = await initializeContracts(provider);
            if (initializedContracts) {
                setContracts(initializedContracts);
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet!");
        }
    };

    const disconnectWallet = () => {
        setAccount(DEFAULT_ACCOUNT);  // Reset to default account
        setIsConnected(false);
        // Reinitialize with default signer
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