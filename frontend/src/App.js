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
                            <Web3Context.Consumer>
                                {({ isConnected }) => 
                                    isConnected 
                                        ? "Your Travel Tokens and NFTs:" 
                                        : "Viewing in read-only mode. Connect wallet to interact."
                                }
                            </Web3Context.Consumer>
                        </p>
                        <TokenBalance />
                        <NFTGallery />
                        <SBTGallery />
                    </div>
                </ErrorBoundary>
            </div>
        </Web3Provider>
    );
}

export default App; 