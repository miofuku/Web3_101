const fs = require('fs');
const path = require('path');

async function main() {
  // Get contract addresses from deployment
  const deployments = {
    TravelNFT: "0x3653Cdfd41DC5fA028cEB2BA4A1E6A95258fCfd8",
    TravelToken: "0x9fB5Ee23B6924ea79f30C33a6778Ce14c9f5D7cB",
    TravelSBT: "0x602B057182294328DB387300CD13d0751EA9C991"
  };

  // Create contracts directory in frontend if it doesn't exist
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Write contract addresses
  fs.writeFileSync(
    path.join(contractsDir, "addresses.json"),
    JSON.stringify(deployments, null, 2)
  );

  // Copy contract ABIs
  const artifacts = ["TravelNFT", "TravelToken", "TravelSBT"];
  artifacts.forEach(artifact => {
    const artifactPath = path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      `${artifact}.sol`,
      `${artifact}.json`
    );
    
    const artifactData = require(artifactPath);
    
    fs.writeFileSync(
      path.join(contractsDir, `${artifact}.json`),
      JSON.stringify(artifactData.abi, null, 2)
    );
  });

  console.log("Frontend files prepared!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 