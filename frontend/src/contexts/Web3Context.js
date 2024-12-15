import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import addresses from '../contracts/addresses.json';
import TravelNFTAbi from '../contracts/TravelNFT.json';
import TravelTokenAbi from '../contracts/TravelToken.json';
import TravelSBTAbi from '../contracts/TravelSBT.json';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [contracts, setContracts] = useState({});
    const [account, setAccount] = useState(null);

    useEffect(() => {
        const init = async () => {
            // Connect to Web3
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                setProvider(provider);
                setAccount(await signer.getAddress());

                // Initialize contracts
                const travelNFT = new ethers.Contract(
                    addresses.TravelNFT,
                    TravelNFTAbi,
                    signer
                );

                const travelToken = new ethers.Contract(
                    addresses.TravelToken,
                    TravelTokenAbi,
                    signer
                );

                const travelSBT = new ethers.Contract(
                    addresses.TravelSBT,
                    TravelSBTAbi,
                    signer
                );

                setContracts({ travelNFT, travelToken, travelSBT });
            }
        };

        init();
    }, []);

    return (
        <Web3Context.Provider value={{ provider, contracts, account }}>
            {children}
        </Web3Context.Provider>
    );
}; 