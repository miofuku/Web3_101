import React, { createContext, useState, useEffect } from 'react';
import { Web3Service } from '../services/Web3Service';
import { SUPPORTED_CHAINS } from '../config/chains';
import TravelNFTContract from '../contracts/TravelNFT.json';
import TravelTokenContract from '../contracts/TravelToken.json';
import TravelSBTContract from '../contracts/TravelSBT.json';
import addresses from '../contracts/addresses.json';
import config from '../config';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [web3Service, setWeb3Service] = useState(null);
    const [currentChain, setCurrentChain] = useState(config.network.toUpperCase());
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeWeb3 = async () => {
            try {
                console.log(`Initializing Web3 for ${config.networkName}...`);
                console.log('Using contract addresses:', addresses);
                
                const contractAbis = {
                    TravelNFT: TravelNFTContract.abi,
                    TravelToken: TravelTokenContract.abi,
                    TravelSBT: TravelSBTContract.abi
                };

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