import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from '../../config/chains';

export class EVMAdapter {
    constructor(chainId) {
        this.chainConfig = SUPPORTED_CHAINS[chainId];
        this.provider = null;
        this.signer = null;
    }

    async connect() {
        this.provider = new ethers.JsonRpcProvider(this.chainConfig.rpcUrl);
        // For Ganache, use a default private key
        if (this.chainConfig.name === 'Ganache') {
            const privateKey = process.env.REACT_APP_GANACHE_PRIVATE_KEY;
            this.signer = new ethers.Wallet(privateKey, this.provider);
        }
        return this.provider;
    }

    async getContract(address, abi) {
        if (!this.provider) await this.connect();
        return new ethers.Contract(
            address, 
            abi, 
            this.signer || this.provider
        );
    }

    async getAddress() {
        if (this.signer) {
            return this.signer.address;
        }
        throw new Error('No signer available');
    }

    async isConnected() {
        return !!this.provider && !!this.signer;
    }

    // Contract-specific methods can be added here if needed
} 