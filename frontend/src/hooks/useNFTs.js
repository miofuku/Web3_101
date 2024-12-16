import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';

export const useNFTs = () => {
    const { contracts, account } = useContext(Web3Context);
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNFTs = async () => {
            if (!contracts.travelNFT || !account) return;
            try {
                // NFT loading logic from NFTGallery component
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