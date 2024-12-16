import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { fetchIPFSMetadata, getIPFSUrl } from '../utils/ipfs';

const MAX_TOKEN_ID = 100; // Reasonable limit for searching tokens

const NFTGallery = () => {
    const { contracts } = useContext(Web3Context);
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNFTs = async () => {
            if (!contracts.travelNFT) return;
            try {
                const nftData = [];
                // Try tokens up to MAX_TOKEN_ID
                for (let tokenId = 1; tokenId <= MAX_TOKEN_ID; tokenId++) {
                    try {
                        const owner = await contracts.travelNFT.ownerOf(tokenId);
                        const tokenURI = await contracts.travelNFT.tokenURI(tokenId);
                        
                        if (tokenURI && !tokenURI.includes("QmExample")) {
                            const metadata = await fetchIPFSMetadata(tokenURI);
                            nftData.push({
                                tokenId,
                                metadata,
                                imageUrl: getIPFSUrl(metadata.image),
                                owner
                            });
                        }
                    } catch (error) {
                        // Silently skip nonexistent tokens
                        if (!error.message.includes("nonexistent token")) {
                            console.error(`Error loading NFT ${tokenId}:`, error);
                        }
                    }
                }
                setNfts(nftData);
            } catch (error) {
                console.error("Error loading NFTs:", error);
            } finally {
                setLoading(false);
            }
        };

        loadNFTs();
    }, [contracts.travelNFT]);

    if (loading) return <div className="loading">Loading NFTs...</div>;

    return (
        <div className="nft-gallery">
            <h2>Travel NFTs</h2>
            {nfts.length === 0 ? (
                <p>No NFTs minted yet</p>
            ) : (
                <div className="nft-grid">
                    {nfts.map((nft) => (
                        <div key={nft.tokenId} className="nft-card">
                            <img src={nft.imageUrl} alt={nft.metadata.name} />
                            <h3>{nft.metadata.name}</h3>
                            <p>{nft.metadata.description}</p>
                            <p className="owner">Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</p>
                            {nft.metadata.attributes?.map((attr, index) => (
                                <div key={index} className="attribute">
                                    <span>{attr.trait_type}:</span>
                                    <span>{attr.value}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NFTGallery; 