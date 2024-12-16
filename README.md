# Travel Web3 DApp

## Setup & Installation
```bash
npm install
cd frontend
npm install
cd ..
```

## Deployment & Frontend Setup
```bash
# Deploy contracts and prepare frontend files
npx hardhat run scripts/deployment/deploy.js --network ganache

# Start the frontend
npm run start-frontend
```

## Interaction Commands
```bash
# Check balances
ACTION=balance npx hardhat run scripts/interaction/interact.js --network ganache

# Mint NFT
ACTION=mintnft npx hardhat run scripts/interaction/interact.js --network ganache

# Mint tokens
ACTION=minttoken npx hardhat run scripts/interaction/interact.js --network ganache

# Mint SBT
ACTION=mintsbt npx hardhat run scripts/interaction/interact.js --network ganache
```

## Project Structure
```
frontend/
├── src/
│   ├── contracts/           # Contract ABIs and addresses
│   │   ├── addresses.json   # Contract addresses
│   │   ├── TravelNFT.json  # NFT contract ABI
│   │   ├── TravelToken.json# Token contract ABI
│   │   └── TravelSBT.json  # SBT contract ABI
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── utils/            # Utility functions
│   └── config/          # App configuration
```

Note: Contract addresses and ABIs are stored in `frontend/src/contracts/`. These files are automatically generated when running the deployment script.