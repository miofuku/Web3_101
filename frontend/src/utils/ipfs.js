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

// Add uploadToIPFS function
export const uploadToIPFS = async (formData) => {
    try {
        // Create meaningful names for files
        const locationName = formData.name.toLowerCase().replace(/\s+/g, '-');
        const timestamp = new Date().toISOString().split('T')[0];

        // Create form data for image upload
        const imageFormData = new FormData();
        imageFormData.append('file', formData.image);
        
        // Add meaningful metadata for image
        const imageMetadata = JSON.stringify({
            name: `${locationName}-image-${timestamp}`,
            description: `Travel photo of ${formData.name}`,
            keyvalues: {
                location: formData.name,
                type: 'travel-nft-image',
                date: timestamp,
                country: formData.country
            }
        });
        imageFormData.append('pinataMetadata', imageMetadata);

        // Add pinata options for image
        const imageOptions = JSON.stringify({
            cidVersion: 1,
            customPinPolicy: {
                regions: [
                    {
                        id: 'FRA1',
                        desiredReplicationCount: 1
                    },
                    {
                        id: 'NYC1',
                        desiredReplicationCount: 1
                    }
                ]
            }
        });
        imageFormData.append('pinataOptions', imageOptions);

        // Upload image to Pinata
        const imageResponse = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            imageFormData,
            {
                headers: {
                    'Content-Type': `multipart/form-data`,
                    'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
                    'pinata_secret_api_key': process.env.REACT_APP_PINATA_API_SECRET
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        const imageUri = `ipfs://${imageResponse.data.IpfsHash}`;

        // Create metadata
        const metadata = {
            name: formData.name,
            description: formData.description || `Travel location: ${formData.name}, ${formData.country}`,
            image: imageUri,
            attributes: [
                {
                    trait_type: "Country",
                    value: formData.country
                },
                {
                    trait_type: "Coordinates",
                    value: formData.coordinates
                },
                {
                    trait_type: "Visit Date",
                    value: timestamp
                }
            ]
        };

        // Upload metadata to Pinata with meaningful name
        const metadataResponse = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            {
                pinataContent: metadata,
                pinataMetadata: {
                    name: `${locationName}-metadata-${timestamp}`,
                    description: `Metadata for ${formData.name} NFT`,
                    keyvalues: {
                        location: formData.name,
                        type: 'travel-nft-metadata',
                        date: timestamp,
                        country: formData.country
                    }
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
                    'pinata_secret_api_key': process.env.REACT_APP_PINATA_API_SECRET
                }
            }
        );

        return `ipfs://${metadataResponse.data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Failed to upload to IPFS: ' + error.message);
    }
}; 