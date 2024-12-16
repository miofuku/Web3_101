import axios from 'axios';
import config from '../config';

const IPFS_GATEWAYS = [
    "https://gateway.pinata.cloud/ipfs/",
    "https://dweb.link/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/"
];

// Simple functions for frontend use
export const parseIPFSHash = (ipfsUrl) => ipfsUrl.replace('ipfs://', '');

export const getIPFSUrl = (ipfsHash, gateway = IPFS_GATEWAYS[0]) => {
    const hash = parseIPFSHash(ipfsHash);
    return `${gateway}${hash}`;
};

export const fetchIPFSMetadata = async (ipfsHash) => {
    const hash = parseIPFSHash(ipfsHash);
    
    for (const gateway of IPFS_GATEWAYS) {
        try {
            const url = `${gateway}${hash}`;
            console.log(`Trying gateway: ${gateway}`);
            
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.status === 200 && response.data) {
                console.log(`Successfully fetched from ${gateway}`);
                return response.data;
            }
        } catch (error) {
            console.log(`Gateway ${gateway} failed:`, error.message);
            continue;
        }
    }
    throw new Error("All IPFS gateways failed");
}; 