require('dotenv').config();

const CONTRACT_ADDRESSES = {
    TravelNFT: process.env.TRAVEL_NFT_ADDRESS,
    TravelToken: process.env.TRAVEL_TOKEN_ADDRESS,
    TravelSBT: process.env.TRAVEL_SBT_ADDRESS
};

function getContractAddress(contractName) {
    const address = CONTRACT_ADDRESSES[contractName];
    if (!address) {
        throw new Error(`Address not found for contract: ${contractName}`);
    }
    return address;
}

module.exports = {
    getContractAddress,
    CONTRACT_ADDRESSES
}; 