import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { fetchIPFSMetadata, getIPFSUrl } from '../utils/ipfs';

export const useNFTs = () => {
    const { contracts, account } = useContext(Web3Context);
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNFTs = async () => {
            if (!contracts.travelNFT || !account) return;
            try {
                const balance = await contracts.travelNFT.balanceOf(account);
                const nftData = [];

                let foundTokens = 0;
                for (let tokenId = 1; foundTokens < parseInt(balance.toString()); tokenId++) {
                    try {
                        const owner = await contracts.travelNFT.ownerOf(tokenId);
                        if (owner.toLowerCase() === account.toLowerCase()) {
                            foundTokens++;
                            const tokenURI = await contracts.travelNFT.tokenURI(tokenId);
                            const metadata = await fetchIPFSMetadata(tokenURI);
                            const imageUrl = getIPFSUrl(metadata.image);

                            nftData.push({
                                tokenId,
                                metadata,
                                imageUrl
                            });
                        }
                    } catch (error) {
                        if (!error.message.includes("nonexistent token")) {
                            console.error(`Error checking token ${tokenId}:`, error.message);
                        }
                    }
                }

                setNfts(nftData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadNFTs();
    }, [contracts.travelNFT, account]);

    return { nfts, loading, error };
}; 