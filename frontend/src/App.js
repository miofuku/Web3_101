import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
import NFTGallery from './components/NFTGallery';

function App() {
    return (
        <Web3Provider>
            <div className="App">
                <h1>Travel DApp</h1>
                <NFTGallery />
            </div>
        </Web3Provider>
    );
}

export default App; 