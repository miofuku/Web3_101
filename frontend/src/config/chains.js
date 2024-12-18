export const SUPPORTED_CHAINS = {
    GANACHE: {
        id: 1337,
        name: 'Ganache',
        rpcUrl: 'http://localhost:7545',
        currency: 'ETH',
        explorer: '',
        isEVM: true
    },
    ETHEREUM: {
        id: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: process.env.REACT_APP_ETH_RPC_URL,
        currency: 'ETH',
        explorer: 'https://etherscan.io',
        isEVM: true
    },
    POLYGON: {
        id: 137,
        name: 'Polygon',
        rpcUrl: process.env.REACT_APP_POLYGON_RPC_URL,
        currency: 'MATIC',
        explorer: 'https://polygonscan.com',
        isEVM: true
    }
};

export const DEFAULT_CHAIN = 'GANACHE';

export const getChainById = (chainId) => {
    return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
};

export const getChainByName = (name) => {
    return SUPPORTED_CHAINS[name.toUpperCase()];
}; 