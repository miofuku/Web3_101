import axios from 'axios';
import { environments } from '../config/environments';

const IPFS_GATEWAYS = [
    "https://nftstorage.link/ipfs/",
    "https://ipfs.filebase.io/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
    "https://ipfs.infura.io/ipfs/",
    "https://dweb.link/ipfs/"
];

// Simple functions for frontend use
export const parseIPFSHash = (ipfsUrl) => ipfsUrl.replace('ipfs://', '');

export const getIPFSUrl = (ipfsHash, gateway = environments.development.ipfsGateway) => {
    const hash = parseIPFSHash(ipfsHash);
    return `${gateway}${hash}`;
};

export const fetchIPFSMetadata = async (ipfsHash) => {
    const hash = parseIPFSHash(ipfsHash);
    
    for (const gateway of IPFS_GATEWAYS) {
        try {
            const url = `${gateway}${hash}`;
            const response = await axios.get(url, {
                timeout: 5000,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'TravelDApp/1.0'
                }
            });
            console.log(`Successfully fetched from ${gateway}`);
            return response.data;
        } catch (error) {
            console.log(`Gateway ${gateway} failed:`, error.message);
            continue;
        }
    }
    throw new Error("All IPFS gateways failed");
}; 