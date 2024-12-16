const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

class IPFSHandler {
    constructor(apiKey, apiSecret) {
        this.pinata = new pinataSDK(apiKey, apiSecret);
    }

    async uploadImage(imagePath) {
        const readableStreamForFile = fs.createReadStream(imagePath);
        const options = {
            pinataMetadata: {
                name: path.basename(imagePath)
            }
        };

        try {
            const result = await this.pinata.pinFileToIPFS(readableStreamForFile, options);
            return `ipfs://${result.IpfsHash}`;
        } catch (error) {
            console.error('Error uploading image to IPFS:', error);
            throw error;
        }
    }

    async uploadMetadata(metadata) {
        const options = {
            pinataMetadata: {
                name: `metadata-${Date.now()}`
            }
        };

        try {
            const result = await this.pinata.pinJSONToIPFS(metadata, options);
            return `ipfs://${result.IpfsHash}`;
        } catch (error) {
            console.error('Error uploading metadata to IPFS:', error);
            throw error;
        }
    }

    async createLocationNFTMetadata(name, country, coordinates, imagePath) {
        // First upload the image
        const imageURI = await this.uploadImage(imagePath);
        
        // Create and upload metadata
        const metadata = {
            name: name,
            description: `Travel location: ${name}, ${country}`,
            image: imageURI,
            attributes: [
                {
                    trait_type: "Country",
                    value: country
                },
                {
                    trait_type: "Coordinates",
                    value: coordinates
                },
                {
                    trait_type: "Visit Date",
                    value: new Date().toISOString()
                }
            ]
        };

        return await this.uploadMetadata(metadata);
    }
}

module.exports = IPFSHandler; 