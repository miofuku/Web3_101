import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { fetchIPFSMetadata, getIPFSUrl } from '../utils/ipfs';

const MAX_TOKENS_TO_CHECK = 10; // Limit the number of tokens to check

const NFTGallery = () => {
    const { contracts } = useContext(Web3Context);
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNFTs = async () => {
            if (!contracts.travelNFT) return;
            try {
                const nftData = [];
                const promises = [];

                // Create array of promises for parallel execution
                for (let tokenId = 1; tokenId <= MAX_TOKENS_TO_CHECK; tokenId++) {
                    promises.push(
                        (async () => {
                            try {
                                const owner = await contracts.travelNFT.ownerOf(tokenId);
                                const tokenURI = await contracts.travelNFT.tokenURI(tokenId);
                                const metadata = await fetchIPFSMetadata(tokenURI);
                                
                                return {
                                    tokenId,
                                    metadata,
                                    imageUrl: getIPFSUrl(metadata.image),
                                    owner
                                };
                            } catch (error) {
                                if (!error.message.includes("nonexistent token")) {
                                    console.error(`Error loading NFT ${tokenId}:`, error);
                                }
                                return null;
                            }
                        })()
                    );
                }

                // Wait for all promises to resolve
                const results = await Promise.all(promises);
                
                // Filter out null results and sort by tokenId
                const validNFTs = results
                    .filter(result => result !== null)
                    .sort((a, b) => a.tokenId - b.tokenId);

                setNfts(validNFTs);
            } catch (error) {
                console.error("Error loading NFTs:", error);
                setError("Failed to load NFTs. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadNFTs();
    }, [contracts.travelNFT]);

    if (loading) return (
        <div className="nft-gallery">
            <h2>Travel NFTs</h2>
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading your NFTs...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="nft-gallery">
            <h2>Travel NFTs</h2>
            <div className="error">{error}</div>
        </div>
    );

    return (
        <div className="nft-gallery">
            <h2>Travel NFTs</h2>
            {nfts.length === 0 ? (
                <p>No NFTs minted yet</p>
            ) : (
                <div className="nft-grid">
                    {nfts.map((nft) => (
                        <div key={nft.tokenId} className="nft-card">
                            <div className="nft-content">
                                <div className="nft-image">
                                    <img src={nft.imageUrl} alt={nft.metadata.name} />
                                </div>
                                <div className="nft-details">
                                    <h3>{nft.metadata.name}</h3>
                                    <div className="metadata">
                                        {nft.metadata.attributes?.map((attr, index) => (
                                            <div key={index} className="attribute">
                                                <span className="label">{attr.trait_type}:</span>
                                                <span className="value">{attr.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NFTGallery; 