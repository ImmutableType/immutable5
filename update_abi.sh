#!/bin/bash

# Extract the ABI from the compiled contract
echo "�� Extracting updated ABI..."

# Get the ABI from Hardhat's artifacts
ABI_PATH="artifacts/contracts/FrothComicDaily.sol/FrothComicDaily.json"

if [ -f "$ABI_PATH" ]; then
  # Extract just the ABI array
  jq '{abi: .abi}' "$ABI_PATH" > lib/contracts/FrothComicDaily.json
  echo "✅ ABI updated at lib/contracts/FrothComicDaily.json"
else
  echo "❌ Compiled contract not found. Run: npx hardhat compile"
  exit 1
fi
