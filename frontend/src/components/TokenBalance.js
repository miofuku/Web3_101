import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { ethers } from 'ethers';

const TokenBalance = () => {
    const { contracts, account } = useContext(Web3Context);
    const [balance, setBalance] = useState('0');

    useEffect(() => {
        const loadBalance = async () => {
            if (!contracts.travelToken || !account) return;
            const balance = await contracts.travelToken.balanceOf(account);
            setBalance(ethers.formatEther(balance));
        };

        loadBalance();
    }, [contracts.travelToken, account]);

    return (
        <div className="token-balance">
            <h2>Travel Tokens</h2>
            <p>Balance: {balance} TRAVEL</p>
        </div>
    );
};

export default TokenBalance; 