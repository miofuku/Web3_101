import React, { useContext, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';

const MintActions = () => {
    const { web3Service } = useContext(Web3Context);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const mintToken = async () => {
        setLoading(true);
        setError(null);
        try {
            const address = await web3Service.getAddress();
            await web3Service.mintTokens(address, 100);
            setSuccess("Successfully minted 100 TRAVEL tokens!");
        } catch (error) {
            console.error('Mint token error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const mintSBT = async () => {
        setLoading(true);
        setError(null);
        try {
            const address = await web3Service.getAddress();
            await web3Service.mintSBT(address, 1);
            setSuccess("Successfully minted Travel Achievement Badge!");
        } catch (error) {
            console.error('Mint SBT error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mint-actions">
            <h2>Mint Actions</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            {loading ? (
                <div className="loading">Transaction in progress...</div>
            ) : (
                <div className="action-buttons">
                    <button 
                        onClick={mintToken}
                        className="mint-button"
                    >
                        Mint 100 TRAVEL Tokens
                    </button>
                    <button 
                        onClick={mintSBT}
                        className="mint-button"
                    >
                        Mint Achievement Badge
                    </button>
                </div>
            )}
        </div>
    );
};

export default MintActions; 