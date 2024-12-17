import { createContext, useState, useEffect } from 'react';
import { Web3Service } from '../services/Web3Service';
import { SUPPORTED_CHAINS } from '../config/chains';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [web3Service, setWeb3Service] = useState(null);
    const [currentChain, setCurrentChain] = useState('GANACHE');

    useEffect(() => {
        const initializeWeb3 = async () => {
            const service = new Web3Service(currentChain);
            await service.initialize(
                require('../contracts/addresses.json'),
                {
                    TravelNFT: require('../contracts/TravelNFT.json'),
                    TravelToken: require('../contracts/TravelToken.json'),
                    TravelSBT: require('../contracts/TravelSBT.json')
                }
            );
            setWeb3Service(service);
        };

        initializeWeb3();
    }, [currentChain]);

    const switchChain = async (chainId) => {
        setCurrentChain(chainId);
    };

    return (
        <Web3Context.Provider value={{ 
            web3Service,
            currentChain,
            switchChain,
            supportedChains: SUPPORTED_CHAINS
        }}>
            {children}
        </Web3Context.Provider>
    );
}; 