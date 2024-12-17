import { getChainAdapter } from '../adapters/web3';
import { ethers } from 'ethers';

export class Web3Service {
    constructor(chainId) {
        this.adapter = getChainAdapter(chainId);
        this.contracts = {};
    }

    async initialize(contractAddresses, abis) {
        await this.adapter.connect();
        
        for (const [name, address] of Object.entries(contractAddresses)) {
            this.contracts[name] = await this.adapter.getContract(address, abis[name]);
        }
    }

    // NFT Operations
    async mintNFT(data) {
        return this.adapter.mintNFT(this.contracts.TravelNFT, data);
    }

    // Token Operations
    async mintTokens(address, amount) {
        try {
            const parsedAmount = ethers.parseEther(amount.toString());
            const tx = await this.contracts.TravelToken.rewardForVisit(address, parsedAmount);
            return await tx.wait();
        } catch (error) {
            console.error('Error minting tokens:', error);
            throw error;
        }
    }

    async getTokenBalance(address) {
        try {
            const balance = await this.contracts.TravelToken.balanceOf(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting token balance:', error);
            throw error;
        }
    }

    // SBT Operations
    async mintSBT(address, milestoneType) {
        try {
            const tx = await this.contracts.TravelSBT.mintMilestoneSBT(address, milestoneType);
            return await tx.wait();
        } catch (error) {
            console.error('Error minting SBT:', error);
            throw error;
        }
    }

    async getSBTBalance(address) {
        try {
            return await this.contracts.TravelSBT.balanceOf(address);
        } catch (error) {
            console.error('Error getting SBT balance:', error);
            throw error;
        }
    }

    // General utility methods
    async getAddress() {
        return this.adapter.getAddress();
    }

    async isConnected() {
        return this.adapter.isConnected();
    }
} 