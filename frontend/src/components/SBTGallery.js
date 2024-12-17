import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';

const MAX_TOKEN_ID = 10;

const SBTGallery = () => {
    const { web3Service } = useContext(Web3Context);
    const [sbts, setSbts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSBTs = async () => {
            if (!web3Service?.contracts?.TravelSBT) return;
            try {
                const sbtAddress = await web3Service.contracts.TravelSBT.getAddress();
                console.log('SBT contract verified at:', sbtAddress);

                console.log('Starting to load SBTs...');
                
                const sbtData = [];
                for (let tokenId = 1; tokenId <= MAX_TOKEN_ID; tokenId++) {
                    try {
                        console.log(`Checking SBT ${tokenId}...`);
                        const owner = await web3Service.contracts.TravelSBT.ownerOf(tokenId);
                        console.log(`Found SBT ${tokenId} owned by ${owner}`);
                        
                        // Add the SBT data without trying to get the type
                        sbtData.push({
                            tokenId: tokenId.toString(),
                            owner,
                            type: "Travel Achievement" // Default type
                        });
                    } catch (error) {
                        // Skip if token doesn't exist
                        if (!error.message.includes("nonexistent token") && 
                            !error.message.includes("ERC721NonexistentToken")) {
                            console.log(`Error checking SBT ${tokenId}:`, error);
                        }
                    }
                }

                console.log('Found SBTs:', sbtData);
                setSbts(sbtData);
            } catch (error) {
                console.error('Error in loadSBTs:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadSBTs();
    }, [web3Service]);

    if (loading) return <div className="loading">Loading achievements...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="sbt-gallery">
            <h2>Travel Achievement Badges (SBTs)</h2>
            {sbts.length === 0 ? (
                <div className="empty-state">
                    <p>No achievements earned yet</p>
                    <p className="hint">Complete travel milestones to earn achievement badges!</p>
                </div>
            ) : (
                <div className="sbt-grid">
                    {sbts.map((sbt) => (
                        <div key={sbt.tokenId} className="sbt-card">
                            <h3>Achievement #{sbt.tokenId}</h3>
                            <p>Type: {sbt.type}</p>
                            <p className="owner">
                                Owner: {sbt.owner.slice(0, 6)}...{sbt.owner.slice(-4)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SBTGallery; 