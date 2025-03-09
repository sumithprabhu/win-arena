"use client";
import { use, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ReactTyped } from "react-typed";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useReadContract, useAccount, useWriteContract } from "wagmi";
import { contractABI, contractAddress } from "../constants/winArenaContractConfig";

// JSON for games with status
const games = [
  { id: "game-1", name: "Game 1", image: "/Assets/game-1.png", status: "live", url: "jump-mountains" },
  { id: "game-2", name: "Game 2", image: "/Assets/game-2.png", status: "coming-soon" },
  { id: "game-3", name: "Game 3", image: "/Assets/game-3.png", status: "coming-soon" },
  { id: "game-4", name: "Game 4", image: "/Assets/game-4.png", status: "coming-soon" },
  { id: "game-5", name: "Game 5", image: "/Assets/game-5.png", status: "coming-soon" },
];



const Home = () => {
  const router = useRouter();
  const { address } = useAccount(); // Get connected wallet address
  const [userRegistered, setUserRegistered] = useState(null);
  const { data: hash, writeContract } = useWriteContract()


  const approveMaxSpending = async () => {
    try {
      const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
  
      writeContract({
        address: "0x1F403d5b848DabD6BE2EAFE46F772d60240A5AA6",
        abi: [
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "approve",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "allowance",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
              }
            ],
            "name": "ERC20InsufficientAllowance",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "sender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "balance",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
              }
            ],
            "name": "ERC20InsufficientBalance",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "approver",
                "type": "address"
              }
            ],
            "name": "ERC20InvalidApprover",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
              }
            ],
            "name": "ERC20InvalidReceiver",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "sender",
                "type": "address"
              }
            ],
            "name": "ERC20InvalidSender",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              }
            ],
            "name": "ERC20InvalidSpender",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "name": "mint",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              }
            ],
            "name": "OwnableInvalidOwner",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "OwnableUnauthorizedAccount",
            "type": "error"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "Approval",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
          },
          {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "transfer",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "Transfer",
            "type": "event"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "from",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "transferFrom",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              }
            ],
            "name": "allowance",
            "outputs": [
              {
                "internalType": "uint256",
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
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "balanceOf",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "decimals",
            "outputs": [
              {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "name",
            "outputs": [
              {
                "internalType": "string",
                "name": "",
                "type": "string"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "owner",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "symbol",
            "outputs": [
              {
                "internalType": "string",
                "name": "",
                "type": "string"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: "approve",
        args: ["0xE2318b875E6ebb7D098187E958803b3B34bE511E", 1000000000],
      });
  
      console.log(`Approval transaction sent: ${hash}`);
    } catch (error) {
      console.error("Error approving spender:", error);
    }
  };



  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />

      {/* Platform Description Section */}
      <div className="flex justify-center items-center flex-grow">
        <div className="border-[4px] border-black bg-white pixel-corners p-6 w-[80%] text-left">
          <h1 className="text-3xl pixel-font">
            <ReactTyped
              className="block"
              strings={[
                "Win Arena is a play-to-earn one-stop with multiple games coming your way. Try unlimited times, best score counts, scale up the leaderboard, time-bound tournaments, and leaderboard-decided winners!",
              ]}
              typeSpeed={30}
              showCursor={true}
              cursorChar={"_"} // Cursor blinks at the end
            />
          </h1>
        </div>
      </div>

      
      {/* Outer Div with Border Around Marquee */}
      <div className="w-full flex justify-center py-6">
        <div className="relative border-[4px] border-black pixel-corners p-4 w-[90%] max-w-7xl overflow-hidden">
          {/* Infinite Scrolling Square Divs */}
          <Marquee gradient={false} speed={30} pauseOnHover={true} className="overflow-hidden">
            {games.map((game, index) => (
              <div
                key={index}
                className={`relative w-80 h-80 border-[4px] border-black mx-6 pixel-corners bg-white ${
                  game.status === "coming-soon" ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
                onClick={() => game.status === "live" && router.push(`/${game.url}`)}
                onMouseDown={(e) => {
                  if (game.status === "live") e.currentTarget.style.transform = "translate(4px, 4px)";
                }}
                onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0px, 0px)")}
              >
                {/* Pixelated Shadow (Behind the Button) */}
                <div className="absolute top-2 left-2 w-full h-full bg-black pixel-corners -z-10"></div>

                {/* Status Indicators */}
                {game.status === "live" && (
                  <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>LIVE</span>
                  </div>
                )}

                {game.status === "coming-soon" && (
                  <>
                    {/* Centered "Coming Soon" Banner */}
                    <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 bg-red-700 text-white text-xl font-bold py-2 w-full text-center z-10">
                      Coming Soon
                    </div>

                    {/* Blur Effect */}
                    <div className="absolute inset-0 bg-white opacity-10 backdrop-blur-sm"></div>
                  </>
                )}

                {/* Game Image */}
                <Image src={game.image} alt={game.name} width={240} height={240} className="w-full h-full object-cover" />
              </div>
            ))}
          </Marquee>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
