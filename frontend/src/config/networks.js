import { SUPPORTED_CHAINS } from './chains';

export const NETWORK_CONFIG = {
    development: {
        defaultChain: SUPPORTED_CHAINS.GANACHE,
        allowedChains: ['GANACHE'],
        features: {
            nft: true,
            token: true,
            sbt: true
        }
    },
    testnet: {
        defaultChain: SUPPORTED_CHAINS.SEPOLIA,
        allowedChains: ['SEPOLIA', 'POLYGON'],
        features: {
            nft: true,
            token: true,
            sbt: true
        }
    },
    production: {
        defaultChain: SUPPORTED_CHAINS.ETHEREUM,
        allowedChains: ['ETHEREUM', 'POLYGON'],
        features: {
            nft: true,
            token: true,
            sbt: true
        }
    }
};

export const getCurrentNetwork = () => {
    const env = process.env.REACT_APP_NODE_ENV || 'development';
    return NETWORK_CONFIG[env];
}; 