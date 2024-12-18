import { getChainAdapter } from '../adapters/web3';
import { ethers } from 'ethers';

export class Web3Service {
    constructor(chainId) {
        this.adapter = getChainAdapter(chainId);
        this.contracts = {};
    }

    async initialize(contractAddresses, abis) {
        try {
            console.log('Initializing Web3Service...');
            
            // Validate inputs
            if (!contractAddresses || !abis) {
                throw new Error('Missing contract addresses or ABIs');
            }

            await this.adapter.connect();

            for (const [name, address] of Object.entries(contractAddresses)) {
                // Skip if address is missing
                if (!address) {
                    console.warn(`Missing address for ${name}`);
                    continue;
                }

                // Validate ABI
                const abi = abis[name];
                if (!abi) {
                    console.error(`Missing ABI for ${name}`);
                    continue;
                }

                try {
                    console.log(`Initializing ${name} contract at ${address} with ABI:`, 
                        abi.length ? 'ABI loaded' : 'Empty ABI');
                    
                    this.contracts[name] = await this.adapter.getContract(
                        address,
                        abi
                    );

                    // Verify contract initialization
                    if (this.contracts[name]) {
                        const code = await this.adapter.provider.getCode(address);
                        if (code === '0x') {
                            throw new Error(`No contract deployed at ${address}`);
                        }
                        console.log(`${name} contract initialized successfully`);
                    }
                } catch (error) {
                    console.error(`Error initializing ${name} contract:`, error);
                    throw error;
                }
            }

            console.log('Web3Service initialization complete');
            console.log('Initialized contracts:', Object.keys(this.contracts));
        } catch (error) {
            console.error('Error initializing Web3Service:', error);
            throw error;
        }
    }

    // NFT Operations
    async mintNFT(data) {
        if (!this.contracts.TravelNFT) throw new Error('NFT contract not initialized');
        try {
            console.log('Minting NFT with data:', data);
            const [name, country, coordinates, tokenURI, nftType] = data;
            
            // Get the current signer's address
            const address = await this.getAddress();
            
            // Use mintLocationNFT instead of safeMint
            const tx = await this.contracts.TravelNFT.mintLocationNFT(
                address,
                name,
                country,
                coordinates,
                tokenURI,
                nftType
            );
            
            const receipt = await tx.wait();
            console.log('NFT minted successfully:', receipt);
            return receipt;
        } catch (error) {
            console.error('Error minting NFT:', error);
            throw error;
        }
    }

    // Token Operations
    async mintTokens(address, amount) {
        if (!this.contracts.TravelToken) throw new Error('Token contract not initialized');
        try {
            const parsedAmount = ethers.parseEther(amount.toString());
            const tx = await this.contracts.TravelToken.rewardForVisit(address, parsedAmount);
            return await tx.wait();
        } catch (error) {
            console.error('Error minting tokens:', error);
            throw error;
        }
    }

    // SBT Operations
    async mintSBT(address, milestoneType) {
        if (!this.contracts.TravelSBT) throw new Error('SBT contract not initialized');
        try {
            const tx = await this.contracts.TravelSBT.mintMilestoneSBT(address, milestoneType);
            return await tx.wait();
        } catch (error) {
            console.error('Error minting SBT:', error);
            throw error;
        }
    }

    async getAddress() {
        return this.adapter.getAddress();
    }

    async isConnected() {
        return this.adapter.isConnected();
    }
} 