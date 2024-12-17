import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { ethers } from 'ethers';

const TokenBalance = () => {
    const { web3Service, currentChain } = useContext(Web3Context);
    const [balance, setBalance] = useState('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBalance = async () => {
            if (!web3Service?.contracts?.TravelToken) return;
            try {
                const tokenBalance = await web3Service.contracts.TravelToken.totalSupply();
                setBalance(ethers.formatEther(tokenBalance));
            } catch (error) {
                console.error("Error loading balance:", error);
            } finally {
                setLoading(false);
            }
        };

        loadBalance();
    }, [web3Service]);

    if (loading) return <div className="loading">Loading token info...</div>;

    return (
        <div className="token-balance">
            <h2>Travel Tokens</h2>
            <p>Total Supply: {balance} TRAVEL</p>
        </div>
    );
};

export default TokenBalance; 