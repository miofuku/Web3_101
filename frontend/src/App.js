import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
import NFTGallery from './components/NFTGallery';
import TokenBalance from './components/TokenBalance';
import SBTGallery from './components/SBTGallery';

function App() {
    return (
        <Web3Provider>
            <div className="App">
                <h1>Travel DApp</h1>
                <TokenBalance />
                <NFTGallery />
                <SBTGallery />
            </div>
        </Web3Provider>
    );
}

export default App; 