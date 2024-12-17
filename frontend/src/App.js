import React from 'react';
import { Web3Provider, Web3Context } from './contexts/Web3Context';
import WalletConnection from './components/WalletConnection';
import NFTGallery from './components/NFTGallery';
import TokenBalance from './components/TokenBalance';
import SBTGallery from './components/SBTGallery';
import MintActions from './components/MintActions';
import NFTMinter from './components/NFTMinter';
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
                        <div className="interaction-section">
                            <MintActions />
                            <NFTMinter />
                        </div>
                        <div className="display-section">
                            <TokenBalance />
                            <NFTGallery />
                            <SBTGallery />
                        </div>
                    </div>
                </ErrorBoundary>
            </div>
        </Web3Provider>
    );
}

export default App; 