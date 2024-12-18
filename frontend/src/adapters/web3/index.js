import { EVMAdapter } from './evm';
import { SUPPORTED_CHAINS } from '../../config/chains';

export const getChainAdapter = (chainId) => {
    // For now, return EVM adapter for all supported EVM chains
    const chain = SUPPORTED_CHAINS[chainId];
    if (!chain) {
        throw new Error(`Chain ${chainId} not supported`);
    }
    
    if (chain.isEVM) {
        return new EVMAdapter(chainId);
    }
    throw new Error(`Chain ${chainId} not supported`);
}; 