# Travel Web3 DApp

## Setup & Installation
```
npm install
```

## Environment Setup
Create a `.env` file with:
```
GANACHE_PRIVATE_KEY=your_private_key
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_secret
```

## Asset Setup
```
mkdir assets
```

### Add travel images to assets folder:
- mount-fuji.jpeg
- eiffel-tower.jpeg

## Contract Deployment
```
npx hardhat run scripts/deploy.js --network ganache
```

## Interaction Commands

### NFT Operations
```bash
# Mint NFT
ACTION=mintnft npx hardhat run scripts/interact.js --network ganache

# Verify NFTs
npx hardhat run scripts/verify-nft.js --network ganache token [tokenId]
npx hardhat run scripts/verify-nft.js --network ganache address [address]
npx hardhat run scripts/verify-nft.js --network ganache all
```

### Token Operations
```bash
# Mint tokens
ACTION=minttoken npx hardhat run scripts/interact.js --network ganache

# Mint SBT
ACTION=mintsbt npx hardhat run scripts/interact.js --network ganache

# Check balances
ACTION=balance npx hardhat run scripts/interact.js --network ganache
```

### Run All Operations
```bash
# Mint NFT, tokens, and SBT
ACTION=all npx hardhat run scripts/interact.js --network ganache
```

## Frontend Preparation
- For development environment
```
npx hardhat run scripts/prepare-frontend.js 
```

- For production environment
```
npx hardhat run scripts/prepare-frontend.js production
```

## Testing
```
npx hardhat test
```