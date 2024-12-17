import React, { useContext, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { uploadToIPFS } from '../utils/ipfs';
import { LOCATIONS, getImagePath } from '../config/locations';

const NFTMinter = () => {
    const { web3Service } = useContext(Web3Context);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedLocations, setSelectedLocations] = useState({});
    const [showForm, setShowForm] = useState(true);
    const [mintedNFTs, setMintedNFTs] = useState([]);

    const handleLocationSelect = (locationKey) => {
        setSelectedLocations(prev => ({
            ...prev,
            [locationKey]: !prev[locationKey]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setShowForm(false);

        const selectedKeys = Object.keys(selectedLocations).filter(key => selectedLocations[key]);
        
        if (selectedKeys.length === 0) {
            setError("Please select at least one location");
            setShowForm(true);
            setLoading(false);
            return;
        }

        try {
            const newMintedNFTs = [];
            for (const locationKey of selectedKeys) {
                const location = LOCATIONS[locationKey];
                
                // Fetch the image file
                const imageResponse = await fetch(getImagePath(locationKey));
                const imageBlob = await imageResponse.blob();
                
                // Create a File object with proper name
                const imageFile = new File(
                    [imageBlob], 
                    `${location.name.toLowerCase().replace(/\s+/g, '-')}.jpeg`, 
                    { type: 'image/jpeg' }
                );

                // Create FormData with location info
                const formData = {
                    name: location.name,
                    country: location.country,
                    coordinates: location.coordinates,
                    description: location.description,
                    image: imageFile
                };

                // Upload to IPFS
                const tokenURI = await uploadToIPFS(formData);
                
                // Use Web3Service to mint NFT
                const tx = await web3Service.mintNFT([
                    location.name,
                    location.country,
                    location.coordinates,
                    tokenURI,
                    0 // NFTType.COLLECTIBLE
                ]);
                const receipt = await tx.wait();
                
                newMintedNFTs.push({
                    location,
                    tokenURI,
                    txHash: receipt.hash
                });
            }
            
            setMintedNFTs(newMintedNFTs);
            setSuccess(`Successfully minted ${newMintedNFTs.length} NFTs!`);
        } catch (error) {
            console.error('Minting error:', error);
            setError(error.message);
            setShowForm(true);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedLocations({});
        setShowForm(true);
        setSuccess(null);
        setError(null);
        setMintedNFTs([]);
    };

    if (loading) {
        return (
            <div className="nft-minter">
                <h2>Minting Your Travel NFTs</h2>
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Please wait while we mint your NFTs...</p>
                </div>
            </div>
        );
    }

    if (mintedNFTs.length > 0) {
        return (
            <div className="nft-minter success-view">
                <h2>Successfully Minted NFTs!</h2>
                <div className="minted-nfts-showcase">
                    {mintedNFTs.map((nft, index) => {
                        // Find the location key by matching the name
                        const locationKey = Object.keys(LOCATIONS).find(
                            key => LOCATIONS[key].name === nft.location.name
                        );
                        
                        return (
                            <div key={index} className="minted-nft-card">
                                <img 
                                    src={locationKey ? getImagePath(locationKey) : nft.location.imagePath} 
                                    alt={nft.location.name}
                                    onError={(e) => {
                                        console.error('Failed to load image:', e);
                                        e.target.src = '/assets/placeholder.jpeg';
                                    }}
                                />
                                <div className="nft-info">
                                    <h3>{nft.location.name}</h3>
                                    <p>{nft.location.country}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button onClick={resetForm} className="reset-button">
                    Mint More NFTs
                </button>
            </div>
        );
    }

    return (
        <div className="nft-minter">
            <h2>Your Travel Experience</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            {showForm && (
                <form onSubmit={handleSubmit} className="travel-form">
                    <p className="form-description">
                        Select the places you've visited:
                    </p>
                    <div className="location-checkboxes">
                        {Object.entries(LOCATIONS).map(([key, location]) => (
                            <label key={key} className="location-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedLocations[key] || false}
                                    onChange={() => handleLocationSelect(key)}
                                />
                                <span className="location-name">{location.name}</span>
                                <span className="location-country">({location.country})</span>
                            </label>
                        ))}
                    </div>
                    <button type="submit" className="submit-button">
                        Mint Selected NFTs
                    </button>
                </form>
            )}
        </div>
    );
};

export default NFTMinter; 