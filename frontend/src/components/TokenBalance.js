import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { ethers } from 'ethers';

const TokenBalance = () => {
    const { contracts } = useContext(Web3Context);
    const [totalSupply, setTotalSupply] = useState('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTokenInfo = async () => {
            if (!contracts.travelToken) return;
            try {
                // Get total supply instead of balance for read-only mode
                const supply = await contracts.travelToken.totalSupply();
                setTotalSupply(ethers.formatEther(supply));
            } catch (error) {
                console.error("Error loading token info:", error);
            } finally {
                setLoading(false);
            }
        };

        loadTokenInfo();
    }, [contracts.travelToken]);

    if (loading) return <div className="loading">Loading token info...</div>;

    return (
        <div className="token-balance">
            <h2>Travel Tokens</h2>
            <p>Total Supply: {totalSupply} TRAVEL</p>
        </div>
    );
};

export default TokenBalance; 