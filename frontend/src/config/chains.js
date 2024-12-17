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
        name: 'Ethereum',
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
    // Add other chains as needed
}; 