require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

// For debugging
console.log('GANACHE_PRIVATE_KEY:', process.env.GANACHE_PRIVATE_KEY);

// Remove 0x prefix if present and ensure proper format
const formatPrivateKey = (key) => {
    if (!key) return null;
    return key.startsWith('0x') ? key : `0x${key}`;
};

const GANACHE_PRIVATE_KEY = formatPrivateKey(process.env.GANACHE_PRIVATE_KEY);

if (!GANACHE_PRIVATE_KEY) {
    console.error('Warning: GANACHE_PRIVATE_KEY not found in .env');
}

module.exports = {
    solidity: "0.8.20",
    networks: {
        ganache: {
            url: "http://127.0.0.1:7545",
            chainId: 1337,
            accounts: GANACHE_PRIVATE_KEY ? [GANACHE_PRIVATE_KEY] : {
                mnemonic: "test test test test test test test test test test test junk",
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
            },
            gas: 5000000,
            gasPrice: 20000000000,
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL,
            chainId: 11155111,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        },
        polygon: {
            url: process.env.POLYGON_RPC_URL,
            chainId: 137,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    }
}; 