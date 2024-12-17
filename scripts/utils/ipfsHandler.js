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

            const response = await axios.post(
                `${this.endpoint}/pinning/pinFileToIPFS`,
                formData,
                {
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.apiSecret
                    }
                }
            );

            return `ipfs://${response.data.IpfsHash}`;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    }

    async uploadJSON(jsonData, name) {
        try {
            const response = await axios.post(
                `${this.endpoint}/pinning/pinJSONToIPFS`,
                {
                    pinataContent: jsonData,
                    pinataMetadata: { name }
                },
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
            console.error("Error uploading JSON:", error);
            throw error;
        }
    }
}

module.exports = IPFSHandler; 