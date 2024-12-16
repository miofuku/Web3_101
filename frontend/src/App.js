import React from 'react';
import { Web3Provider, Web3Context } from './contexts/Web3Context';
import WalletConnection from './components/WalletConnection';
import NFTGallery from './components/NFTGallery';
import TokenBalance from './components/TokenBalance';
import SBTGallery from './components/SBTGallery';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

function App() {
    return (
        <Web3Provider>
            <div className="App">
                <h1>Travel DApp</h1>
                <ErrorBoundary>
                    <WalletConnection />
                    <div className="dapp-content">
                        <p className="welcome-message">
                            Welcome to Travel DApp! Connect your wallet to view your travel tokens and NFTs.
                        </p>
                        <Web3Context.Consumer>
                            {({ isConnected }) => isConnected ? (
                                <>
                                    <TokenBalance />
                                    <NFTGallery />
                                    <SBTGallery />
                                </>
                            ) : null}
                        </Web3Context.Consumer>
                    </div>
                </ErrorBoundary>
            </div>
        </Web3Provider>
    );
}

export default App; 