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
- Mint NFT
```
npx hardhat run scripts/interact.js --network ganache mintnft [recipient_address] [MOUNT_FUJI|EIFFEL_TOWER]
```

- Verify NFTs
```
npx hardhat run scripts/verify-nft.js --network ganache token [tokenId]
npx hardhat run scripts/verify-nft.js --network ganache address [address]
npx hardhat run scripts/verify-nft.js --network ganache all
```

### Token Operations
- Mint Tokens
```
npx hardhat run scripts/interact.js --network ganache minttoken [recipient_address] [amount]
```

- Mint SBT
```
npx hardhat run scripts/interact.js --network ganache mintsbt [recipient_address] [milestone_type]
```

- Check Balances
```
npx hardhat run scripts/interact.js --network ganache balance [address]
```

### Run All Operations
 - Mint NFT, tokens, and SBT
```
npx hardhat run scripts/interact.js --network ganache all [recipient_address]
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