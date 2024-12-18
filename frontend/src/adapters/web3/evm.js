import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from '../../config/chains';

export class EVMAdapter {
    constructor(chainId) {
        this.chainConfig = SUPPORTED_CHAINS[chainId];
        this.provider = null;
        this.signer = null;
    }

    async connect() {
        try {
            // For Ganache, use JsonRpcProvider
            if (this.chainConfig.name === 'Ganache') {
                this.provider = new ethers.JsonRpcProvider(this.chainConfig.rpcUrl);
                
                // Get signer from provider
                const signer = await this.provider.getSigner();
                // Verify signer
                const address = await signer.getAddress();
                console.log('Connected to address:', address);
                
                this.signer = signer;
            } else {
                // For other networks, use the configured provider
                this.provider = new ethers.JsonRpcProvider(this.chainConfig.rpcUrl);
            }

            return this.provider;
        } catch (error) {
            console.error('Failed to connect to provider:', error);
            throw error;
        }
    }

    async getContract(address, abi) {
        if (!this.provider) await this.connect();
        
        // Always use signer if available, otherwise use provider
        const contractRunner = this.signer || this.provider;
        const contract = new ethers.Contract(address, abi, contractRunner);
        
        // Verify contract connection
        console.log('Contract initialized at:', address);
        return contract;
    }

    async getAddress() {
        try {
            if (!this.signer) {
                await this.connect();
            }
            if (!this.signer) {
                throw new Error('No signer available');
            }
            return await this.signer.getAddress();
        } catch (error) {
            console.error('Error getting address:', error);
            throw error;
        }
    }

    async isConnected() {
        try {
            if (!this.signer) {
                await this.connect();
            }
            const address = await this.getAddress();
            return !!address;
        } catch (error) {
            console.error('Connection check failed:', error);
            return false;
        }
    }
} 