import { EVMAdapter } from './evm';
// import { SolanaAdapter } from './solana'; // Future implementation

export const getChainAdapter = (chainId) => {
    // For now, return EVM adapter for all supported EVM chains
    if (SUPPORTED_CHAINS[chainId]?.isEVM) {
        return new EVMAdapter(chainId);
    }
    throw new Error(`Chain ${chainId} not supported`);
}; 