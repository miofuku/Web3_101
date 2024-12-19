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
            if (this.chainConfig.name === 'Ganache') {
                this.provider = new ethers.JsonRpcProvider(this.chainConfig.rpcUrl);
                this.signer = await this.provider.getSigner();
            } else {
                // For Sepolia, use MetaMask
                if (typeof window.ethereum !== 'undefined') {
                    // Request account access
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    
                    // Create Web3Provider
                    this.provider = new ethers.BrowserProvider(window.ethereum);
                    this.signer = await this.provider.getSigner();
                    
                    // Switch to correct network if needed
                    await this.ensureCorrectNetwork();
                } else {
                    throw new Error('Please install MetaMask');
                }
            }

            const address = await this.signer.getAddress();
            console.log('Connected to address:', address);
            
            return this.provider;
        } catch (error) {
            console.error('Failed to connect:', error);
            throw error;
        }
    }

    async ensureCorrectNetwork() {
        try {
            // Check if we need to switch networks
            const chainId = await this.provider.send('eth_chainId', []);
            if (chainId !== `0x${this.chainConfig.id.toString(16)}`) {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${this.chainConfig.id.toString(16)}` }],
                });
            }
        } catch (error) {
            if (error.code === 4902) {
                // Network needs to be added
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${this.chainConfig.id.toString(16)}`,
                        chainName: this.chainConfig.name,
                        nativeCurrency: {
                            name: 'ETH',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: [this.chainConfig.rpcUrl],
                        blockExplorerUrls: [this.chainConfig.explorer]
                    }]
                });
            } else {
                throw error;
            }
        }
    }

    async getContract(address, abi) {
        if (!this.provider) await this.connect();
        return new ethers.Contract(address, abi, this.signer);
    }

    async getAddress() {
        if (!this.signer) {
            await this.connect();
        }
        if (!this.signer) {
            throw new Error('No signer available');
        }
        return await this.signer.getAddress();
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