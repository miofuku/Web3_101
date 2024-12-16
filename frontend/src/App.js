import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
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
                <WalletConnection />
                <ErrorBoundary>
                    {/* Only show components when wallet is connected */}
                    <Web3Context.Consumer>
                        {({ isConnected }) => isConnected ? (
                            <>
                                <TokenBalance />
                                <NFTGallery />
                                <SBTGallery />
                            </>
                        ) : (
                            <p>Please connect your wallet to view your travel tokens and NFTs.</p>
                        )}
                    </Web3Context.Consumer>
                </ErrorBoundary>
            </div>
        </Web3Provider>
    );
}

export default App; 