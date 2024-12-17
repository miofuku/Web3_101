export * from './chains';
export * from './locations';
export * from './ipfs';

export const CONFIG = {
    defaultChain: 'GANACHE',
    supportedFeatures: {
        NFT: true,
        Token: true,
        SBT: true
    }
};