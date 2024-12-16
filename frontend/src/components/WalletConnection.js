import React, { useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';

const WalletConnection = () => {
    const { account, isConnected, connectWallet, disconnectWallet } = useContext(Web3Context);

    return (
        <div className="wallet-connection">
            {!isConnected ? (
                <button onClick={connectWallet}>Connect Wallet</button>
            ) : (
                <div>
                    <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
                    <button onClick={disconnectWallet}>Disconnect</button>
                </div>
            )}
        </div>
    );
};

export default WalletConnection; 