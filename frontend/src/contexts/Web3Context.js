import React, { createContext, useState, useEffect } from 'react';
import { Web3Service } from '../services/Web3Service';
import { SUPPORTED_CHAINS } from '../config/chains';
// Import full contract JSON files
import TravelNFTContract from '../contracts/TravelNFT.json';
import TravelTokenContract from '../contracts/TravelToken.json';
import TravelSBTContract from '../contracts/TravelSBT.json';
import addresses from '../contracts/addresses.json';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [web3Service, setWeb3Service] = useState(null);
    const [currentChain, setCurrentChain] = useState('GANACHE');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeWeb3 = async () => {
            try {
                console.log('Starting Web3 initialization...');
                
                // Log contract data for debugging
                console.log('Contract addresses:', addresses);
                
                const contractAbis = {
                    TravelNFT: TravelNFTContract.abi,
                    TravelToken: TravelTokenContract.abi,
                    TravelSBT: TravelSBTContract.abi
                };

                // Verify ABIs are loaded
                Object.entries(contractAbis).forEach(([name, abi]) => {
                    if (!abi) {
                        console.error(`Missing ABI for ${name}`);
                    } else {
                        console.log(`${name} ABI loaded with ${abi.length} functions`);
                    }
                });

                const service = new Web3Service(currentChain);
                await service.initialize(addresses, contractAbis);
                
                setWeb3Service(service);
                setIsInitialized(true);
                console.log('Web3 initialization complete');
            } catch (error) {
                console.error('Failed to initialize Web3:', error);
            }
        };

        if (!isInitialized) {
            initializeWeb3();
        }
    }, [currentChain, isInitialized]);

    const switchChain = async (chainId) => {
        setCurrentChain(chainId);
        setIsInitialized(false);
    };

    return (
        <Web3Context.Provider value={{ 
            web3Service,
            currentChain,
            switchChain,
            supportedChains: SUPPORTED_CHAINS,
            isInitialized
        }}>
            {children}
        </Web3Context.Provider>
    );
}; 