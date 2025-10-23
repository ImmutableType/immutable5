#!/bin/bash

# Backup original
cp contracts/FrothComicDaily.sol contracts/FrothComicDaily.sol.backup

# Fix 1: Change Submission struct wordIndices field (line ~91)
sed -i '' 's/uint256\[4\]\[\] wordIndices;/uint256[][] wordIndices;/' contracts/FrothComicDaily.sol

# Fix 2: Change submitEntry function parameter (line ~305)
sed -i '' 's/uint256\[4\]\[\] calldata wordIndices/uint256[][] calldata wordIndices/' contracts/FrothComicDaily.sol

# Fix 3: Rename openTime to opensAt in struct
sed -i '' 's/uint256 openTime;/uint256 opensAt;/' contracts/FrothComicDaily.sol

# Fix 4: Rename closeTime to closesAt in struct  
sed -i '' 's/uint256 closeTime;/uint256 closesAt;/' contracts/FrothComicDaily.sol

# Fix 5: Update all references to openTime -> opensAt
sed -i '' 's/\.openTime/\.opensAt/g' contracts/FrothComicDaily.sol
sed -i '' 's/template\.openTime/template.opensAt/g' contracts/FrothComicDaily.sol

# Fix 6: Update all references to closeTime -> closesAt
sed -i '' 's/\.closeTime/\.closesAt/g' contracts/FrothComicDaily.sol
sed -i '' 's/template\.closeTime/template.closesAt/g' contracts/FrothComicDaily.sol

# Fix 7: Add word count validation in submitEntry function
# Find line with "Must have exactly 4 panels" and add validation after it
perl -i -pe 's/(require\(wordIndices\.length == 4, "Must have exactly 4 panels"\);)/$1\n        for (uint256 i = 0; i < 4; i++) {\n            require(wordIndices[i].length > 0, "Each panel must have at least 1 word");\n            require(wordIndices[i].length <= 10, "Each panel must have at most 10 words");\n        }/' contracts/FrothComicDaily.sol

echo "✅ Contract fixed!"
echo "Backup saved to: contracts/FrothComicDaily.sol.backup"
