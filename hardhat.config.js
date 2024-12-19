require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

// For debugging
console.log('Network configs:');
console.log('- Ganache private key:', process.env.GANACHE_PRIVATE_KEY ? '✓' : '✗');
console.log('- Sepolia private key:', process.env.PRIVATE_KEY ? '✓' : '✗');
console.log('- Sepolia RPC URL:', process.env.SEPOLIA_RPC_URL ? '✓' : '✗');

const formatPrivateKey = (key) => {
    if (!key) return null;
    return key.startsWith('0x') ? key : `0x${key}`;
};

const GANACHE_PRIVATE_KEY = formatPrivateKey(process.env.GANACHE_PRIVATE_KEY);
const SEPOLIA_PRIVATE_KEY = formatPrivateKey(process.env.PRIVATE_KEY);

module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
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
            accounts: SEPOLIA_PRIVATE_KEY ? [SEPOLIA_PRIVATE_KEY] : [],
            gas: "auto",
            gasPrice: "auto",
            gasMultiplier: 1.2
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    }
}; 