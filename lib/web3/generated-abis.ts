// Auto-generated Contract ABIs for Flow EVM Testnet
// Generated: 2025-09-05T02:46:23.353Z

export const CONTRACT_ABIS = {
  "ProfileNFT": {
    "address": "0x09512878ac5662aFDE0bE6046d12B2eEa30A00Fe",
    "abi": [
      {
        "inputs": [
          {
            "name": "to",
            "type": "address"
          },
          {
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ownerOf",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "tokenURI",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "data",
            "type": "tuple",
            "components": [
              {
                "name": "displayName",
                "type": "string"
              },
              {
                "name": "bio",
                "type": "string"
              },
              {
                "name": "location",
                "type": "string"
              },
              {
                "name": "avatarUrl",
                "type": "string"
              },
              {
                "name": "did",
                "type": "string"
              }
            ]
          }
        ],
        "name": "createBasicProfile",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "profileId",
            "type": "uint256"
          }
        ],
        "name": "getProfile",
        "outputs": [
          {
            "name": "",
            "type": "tuple",
            "components": [
              {
                "name": "tier",
                "type": "uint256"
              },
              {
                "name": "did",
                "type": "string"
              },
              {
                "name": "displayName",
                "type": "string"
              },
              {
                "name": "bio",
                "type": "string"
              },
              {
                "name": "location",
                "type": "string"
              },
              {
                "name": "avatarUrl",
                "type": "string"
              },
              {
                "name": "createdAt",
                "type": "uint256"
              }
            ]
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "bytecodeLength": 30872
  },
  "TokenQualifier": {
    "address": "0x78b9240F3EF69cc517A66564fBC488C5E5309DF7",
    "abi": [
      {
        "inputs": [
          {
            "name": "user",
            "type": "address"
          }
        ],
        "name": "isQualified",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "bytecodeLength": 5398
  }
} as const

// Individual exports for easy importing
export const PROFILENFT_ABI = [
  {
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "data",
        "type": "tuple",
        "components": [
          {
            "name": "displayName",
            "type": "string"
          },
          {
            "name": "bio",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "avatarUrl",
            "type": "string"
          },
          {
            "name": "did",
            "type": "string"
          }
        ]
      }
    ],
    "name": "createBasicProfile",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "profileId",
        "type": "uint256"
      }
    ],
    "name": "getProfile",
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          {
            "name": "tier",
            "type": "uint256"
          },
          {
            "name": "did",
            "type": "string"
          },
          {
            "name": "displayName",
            "type": "string"
          },
          {
            "name": "bio",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "avatarUrl",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const TOKENQUALIFIER_ABI = [
  {
    "inputs": [
      {
        "name": "user",
        "type": "address"
      }
    ],
    "name": "isQualified",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const CONTRACTS = {
  PROFILENFT: '0x09512878ac5662aFDE0bE6046d12B2eEa30A00Fe' as const,
  TOKENQUALIFIER: '0x78b9240F3EF69cc517A66564fBC488C5E5309DF7' as const
} as const
