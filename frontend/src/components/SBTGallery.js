import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../contexts/Web3Context';

const SBTGallery = () => {
    const { contracts, account } = useContext(Web3Context);
    const [sbtCount, setSbtCount] = useState(0);
    const [sbts, setSbts] = useState([]);

    useEffect(() => {
        const loadSBTs = async () => {
            if (!contracts.travelSBT || !account) return;
            const balance = await contracts.travelSBT.balanceOf(account);
            setSbtCount(balance.toString());

            const sbtData = [];
            for (let i = 1; i <= balance; i++) {
                try {
                    const tokenId = await contracts.travelSBT.tokenOfOwnerByIndex(account, i - 1);
                    sbtData.push({
                        tokenId: tokenId.toString(),
                        type: await contracts.travelSBT.getMilestoneType(tokenId)
                    });
                } catch (error) {
                    console.error(`Error loading SBT ${i}:`, error);
                }
            }
            setSbts(sbtData);
        };

        loadSBTs();
    }, [contracts.travelSBT, account]);

    return (
        <div className="sbt-gallery">
            <h2>Travel Achievement Badges (SBTs)</h2>
            <p>Total Achievements: {sbtCount}</p>
            <div className="sbt-grid">
                {sbts.map((sbt) => (
                    <div key={sbt.tokenId} className="sbt-card">
                        <h3>Achievement #{sbt.tokenId}</h3>
                        <p>Type: {sbt.type}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SBTGallery; 