import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { useNFTs } from '../hooks';
import { fetchIPFSMetadata, getIPFSUrl } from '../utils/ipfs';

const NFTGallery = () => {
    const { nfts, loading, error } = useNFTs();

    if (loading) return <div>Loading NFTs...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="nft-gallery">
            <h2>My Travel NFTs</h2>
            <div className="nft-grid">
                {nfts.map((nft) => (
                    <div key={nft.tokenId} className="nft-card">
                        <img src={nft.imageUrl} alt={nft.metadata.name} />
                        <h3>{nft.metadata.name}</h3>
                        <p>{nft.metadata.description}</p>
                        {nft.metadata.attributes.map((attr, index) => (
                            <div key={index} className="attribute">
                                <span>{attr.trait_type}:</span>
                                <span>{attr.value}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NFTGallery; 