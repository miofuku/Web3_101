import config from '../config';

export const SUPPORTED_CHAINS = {
    GANACHE: {
        id: 1337,
        name: 'Ganache',
        rpcUrl: 'http://localhost:7545',
        currency: 'ETH',
        explorer: '',
        isEVM: true
    },
    SEPOLIA: {
        id: 11155111,
        name: 'Sepolia',
        rpcUrl: config.rpcUrl,
        currency: 'ETH',
        explorer: 'https://sepolia.etherscan.io',
        isEVM: true
    }
};

export const DEFAULT_CHAIN = config.network.toUpperCase();

export const getChainById = (chainId) => {
    return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
};

export const getChainByName = (name) => {
    return SUPPORTED_CHAINS[name.toUpperCase()];
}; 