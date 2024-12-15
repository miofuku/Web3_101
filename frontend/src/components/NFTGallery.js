import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import config from '../config';

const NFTGallery = () => {
    const { contracts, account } = useContext(Web3Context);
    const [nfts, setNfts] = useState([]);

    useEffect(() => {
        const loadNFTs = async () => {
            if (!contracts.travelNFT || !account) return;

            try {
                const balance = await contracts.travelNFT.balanceOf(account);
                const nftData = [];

                for (let i = 0; i < balance; i++) {
                    const tokenId = await contracts.travelNFT.tokenOfOwnerByIndex(account, i);
                    const tokenURI = await contracts.travelNFT.tokenURI(tokenId);
                    
                    // Convert IPFS URI to HTTP URL
                    const ipfsHash = tokenURI.replace("ipfs://", "");
                    const metadataUrl = `${config.ipfsGateway}${ipfsHash}`;
                    
                    // Fetch metadata
                    const response = await fetch(metadataUrl);
                    const metadata = await response.json();
                    
                    // Convert image IPFS URI to HTTP URL
                    const imageHash = metadata.image.replace("ipfs://", "");
                    const imageUrl = `${config.ipfsGateway}${imageHash}`;

                    nftData.push({
                        tokenId,
                        metadata,
                        imageUrl
                    });
                }

                setNfts(nftData);
            } catch (error) {
                console.error("Error loading NFTs:", error);
            }
        };

        loadNFTs();
    }, [contracts.travelNFT, account]);

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