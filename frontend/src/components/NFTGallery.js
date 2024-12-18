import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { fetchIPFSMetadata, getIPFSUrl } from '../utils/ipfs';

const MAX_TOKENS_TO_CHECK = 10;

const NFTGallery = () => {
    const { web3Service } = useContext(Web3Context);
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNFTs = async () => {
            if (!web3Service?.contracts?.TravelNFT) return;
            try {
                const nftData = [];
                const promises = [];

                for (let tokenId = 1; tokenId <= MAX_TOKENS_TO_CHECK; tokenId++) {
                    promises.push(
                        (async () => {
                            try {
                                const owner = await web3Service.contracts.TravelNFT.ownerOf(tokenId);
                                const tokenURI = await web3Service.contracts.TravelNFT.tokenURI(tokenId);
                                const metadata = await fetchIPFSMetadata(tokenURI);
                                
                                return {
                                    tokenId,
                                    metadata,
                                    imageUrl: getIPFSUrl(metadata.image),
                                    owner
                                };
                            } catch (error) {
                                if (!error.message.includes("ERC721NonexistentToken")) {
                                    console.error(`Error loading NFT ${tokenId}:`, error);
                                }
                                return null;
                            }
                        })()
                    );
                }

                const results = await Promise.all(promises);
                const validNFTs = results.filter(result => result !== null);
                setNfts(validNFTs);
            } catch (error) {
                console.error("Error loading NFTs:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadNFTs();
    }, [web3Service]);

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