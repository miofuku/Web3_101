const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class IPFSHandler {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.endpoint = 'https://api.pinata.cloud';
    }

    async uploadFile(filePath, name) {
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const metadata = JSON.stringify({
                name: name || path.basename(filePath)
            });
            formData.append('pinataMetadata', metadata);

            const response = await axios.post(`${this.endpoint}/pinning/pinFileToIPFS`, formData, {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                    'pinata_api_key': this.apiKey,
                    'pinata_secret_api_key': this.apiSecret
                }
            });

            return `ipfs://${response.data.IpfsHash}`;
        } catch (error) {
            console.error("Error uploading file:", error.message);
            if (error.response) {
                console.error("Pinata response:", error.response.data);
            }
            throw error;
        }
    }

    async uploadJSON(jsonData, name) {
        try {
            const options = {
                pinataMetadata: {
                    name: name
                }
            };

            const response = await axios.post(
                `${this.endpoint}/pinning/pinJSONToIPFS`,
                { ...jsonData, ...options },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.apiSecret
                    }
                }
            );

            return `ipfs://${response.data.IpfsHash}`;
        } catch (error) {
            console.error("Error uploading JSON:", error.message);
            if (error.response) {
                console.error("Pinata response:", error.response.data);
            }
            throw error;
        }
    }

    async createLocationNFTMetadata(name, country, coordinates, imagePath) {
        try {
            console.log("Uploading image...");
            const imageFileName = `${name.toLowerCase().replace(/\s+/g, '-')}-image`;
            const imageURI = await this.uploadFile(imagePath, imageFileName);
            console.log("Image uploaded, URI:", imageURI);

            const metadata = {
                name,
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

            console.log("Uploading metadata...");
            const metadataFileName = `${name.toLowerCase().replace(/\s+/g, '-')}-metadata`;
            const tokenURI = await this.uploadJSON(metadata, metadataFileName);
            console.log("Metadata uploaded, URI:", tokenURI);

            return tokenURI;
        } catch (error) {
            console.error("Error creating metadata:", error.message);
            if (error.response) {
                console.error("Pinata response:", error.response.data);
            }
            throw error;
        }
    }
}

module.exports = IPFSHandler; 