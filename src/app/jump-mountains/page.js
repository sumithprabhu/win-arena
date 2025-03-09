"use client";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";
import {
  useReadContract,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  contractABI,
  contractAddress,
} from "../../constants/winArenaContractConfig";
import Countdown from "react-countdown";
import { toast } from "react-toastify";
import Game from "../../components/jump-mountains/Game";
import { useRouter } from "next/navigation"; // Import Next.js router

const GamePage = () => {
  const { address } = useAccount(); // Get user address
  const [activeTab, setActiveTab] = useState("leaderboard");
  const router = useRouter();

  const { data: registerHash, writeContract: registerGame } =
    useWriteContract();
  const { isLoading: isRegistering, isSuccess: isRegisteredSuccess } =
    useWaitForTransactionReceipt({
      hash: registerHash,
    });

  // Handle registration
  const handleRegister = async () => {
    try {
      toast.info("Registering for the game...");

      registerGame({
        address: contractAddress,
        abi: contractABI,
        functionName: "enterGame",
        args: [0],
      });
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Failed to register!");
    }
  };

  // Show success toast when registration is confirmed
  if (isRegisteredSuccess) {
    toast.success("Successfully registered!");
  }

  const { data: isRegistered, refetch } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "viewUserGameStatus",
    args: [0, address], // Check if user is registered
    query: { enabled: !!address }, // Run query only if address exists
  });

  useEffect(() => {
    refetch();
    refetchGame();
  }, [isRegisteredSuccess]); // Refetch when registration is successful

  const {
    data: gameData,
    refetch: refetchGame,
    isLoading,
    error,
  } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "viewGameDetails",
    args: [0],
  });

  // If gameData is available, extract values
  const gameDetails = gameData
    ? {
        entryFee: Number(gameData[0]), // Entry fee in WIN
        leaderboardType: Number(gameData[1]), // Leaderboard type
        startTime: Number(gameData[2]), // Start time (Unix Timestamp)
        poolAmount: Number(gameData[3]), // Total locked WIN pool
        isActive: gameData[4], // Boolean: Is the game live?
      }
    : null;

  const endTime = gameDetails?.startTime * 1000 + 24 * 60 * 60 * 1000; // Assuming game duration is 1 day (adjust as needed)

  const { data: leaderboardData } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "viewLeaderboard",
    args: [0],
  });

  // Dummy data for leaderboard & prizes
  // const leaderboardData = [
  //   { rank: 1, name: "Tacobel#001", score: 120 },
  //   { rank: 2, name: "ShadowKing#999", score: 110 },
  //   { rank: 3, name: "PixelKnight#345", score: 95 },
  //   { rank: 4, name: "GlitchMaster#542", score: 85 },
  //   { rank: 5, name: "NeonBlaze#723", score: 78 },
  //   { rank: 6, name: "SynthWave#893", score: 60 },
  //   { rank: 7, name: "ByteBrawler#111", score: 50 },
  //   { rank: 4, name: "GlitchMaster#542", score: 85 },
  //   { rank: 5, name: "NeonBlaze#723", score: 78 },
  //   { rank: 6, name: "SynthWave#893", score: 60 },
  //   { rank: 7, name: "ByteBrawler#111", score: 50 },
  //   { rank: 4, name: "GlitchMaster#542", score: 85 },
  //   { rank: 5, name: "NeonBlaze#723", score: 78 },
  //   { rank: 6, name: "SynthWave#893", score: 60 },
  // ];

  const prizeData = [
    { rank: "1st Place", prize: "150 WIN" },
    { rank: "2nd Place", prize: "100 WIN" },
    { rank: "3rd Place", prize: "50 WIN" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-black overflow-hidden">
      <Navbar />

      {/* Main Content Container */}
      <div className="flex justify-center items-center flex-grow pt-6 pb-4">
        <div className="w-[95%] max-w-7xl flex justify-between">
          {/* Left Side - Game Details (Reduced Width by 20%) */}
          <div className="w-[40%] border-[4px] border-black p-4 pixel-corners">
            {/* Game Image with Pool & Live Status */}
            <div className="relative w-3/4 mx-auto aspect-square border-[4px] border-black pixel-corners">
              {/* Pool Amount */}
              <div className="absolute top-2 left-2 bg-white border-[2px] border-black px-2 py-1 text-sm italic">
                Pool:{" "}
                <span className="font-bold">{gameDetails?.poolAmount} WIN</span>
              </div>

              {/* Live Indicator */}
              <div className="absolute top-2 right-2 flex items-center px-4 py-1 bg-green-500 text-white text-sm rounded-full">
                <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                Live
              </div>

              <Image
                src="/Assets/game-1.png"
                alt="Game Image"
                layout="fill"
                objectFit="cover"
                className="pixel-corners object-cover z-[-1]"
              />
            </div>

            {/* Game Name & Register Button */}
            <div className="flex justify-between items-center mt-4">
              <h2 className="font-bold text-lg">Jump Mountains</h2>

              {/* Styled Register Button */}
              {/* Styled Register Button */}
              <div className="relative">
                {/* Pixelated Shadow (Fixed) */}
                <div className="absolute top-[4px] left-[4px] w-full h-full bg-black"></div>

                {/* Button (Moves on Click) */}
                <button
                  className="relative bg-yellow-400 text-black pixel-font text-sm px-11 py-2 border-[4px] border-black cursor-pointer"
                  onClick={
                    !isRegistered
                      ? handleRegister
                      : () => router.push("/jump-mountains/play") // Open Game component
                  }
                  disabled={isRegistering}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "translate(4px, 4px)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "translate(0px, 0px)")
                  }
                >
                  {isRegistering
                    ? "Registering..."
                    : isRegistered
                    ? "PLAY GAME"
                    : "REGISTER"}
                </button>

                {/* Show Game Component When Playing */}
              </div>
            </div>

            {/* Entry Fee & Timer */}
            <div className="flex justify-between items-center mt-2">
              <div className="border-[4px] border-black px-3 py-1 text-sm italic">
                Entry Fee:{" "}
                <span className="font-bold"> {gameDetails?.entryFee} WIN</span>
              </div>
              <div className="border-[4px] border-black px-3 py-1 text-sm">
                Ends in:{" "}
                <span className="font-bold">
                  {" "}
                  <Countdown
                    key={endTime}
                    date={endTime} // Target end time
                    renderer={({ hours, minutes, seconds }) => (
                      <span className="font-bold">
                        {String(hours).padStart(2, "0")}:
                        {String(minutes).padStart(2, "0")}:
                        {String(seconds).padStart(2, "0")}
                      </span>
                    )}
                  />
                </span>
              </div>
            </div>

            {/* Game Description */}
            <div className="mt-4 text-sm">
              <p>
                <strong>Description</strong>
              </p>
              <p className="text-gray-700">
                Jump Mountains is an intense precision-based platformer where
                players must strategically extend a stick to bridge gaps between
                platforms. Your goal is to master timing, reach new distances,
                and set the highest score before the game ends!
              </p>

              <p className="mt-2">
                <strong>How to Play</strong>
              </p>
              <p className="text-gray-700">
                - Click and hold to **stretch** the stick; release to drop it.
                <br />
                - Time your release carefully—**too short or too long means
                falling!**
                <br />
                - Landing in the **red middle zone** gives **double points**.
                <br />- Keep going! **Highest score before time runs out wins!**
              </p>
            </div>
          </div>

          {/* Right Side - Leaderboard & Prizes (Takes Full Height) */}
          <div className="w-[55%] border-[4px] border-black p-4 pixel-corners flex flex-col">
            {/* Tab Toggle */}
            <div className="flex">
              <button
                className={`w-1/2 py-2 text-center text-lg font-bold border-[4px] border-black pixel-corners  cursor-pointer ${
                  activeTab === "prizes" ? "bg-yellow-400" : "bg-white"
                }`}
                onClick={() => setActiveTab("prizes")}
              >
                Prizes
              </button>
              <button
                className={`w-1/2 py-2 text-center text-lg font-bold border-[4px] border-black pixel-corners  cursor-pointer ${
                  activeTab === "leaderboard" ? "bg-yellow-400" : "bg-white"
                }`}
                onClick={() => setActiveTab("leaderboard")}
              >
                Leaderboard
              </button>
            </div>

            {/* Content - Leaderboard or Prizes */}
            {/* Content - Leaderboard or Prizes */}
            <div className="mt-4 flex-grow">
              {activeTab === "leaderboard" ? (
                <div className="h-[550px] overflow-y-auto p-2">
                  {isLoading ? (
                    <p>Loading leaderboard...</p>
                  ) : error ? (
                    <p className="text-red-500">Failed to load leaderboard</p>
                  ) : !leaderboardData || leaderboardData.length === 0 ? (
                    <p>No scores yet!</p>
                  ) : (
                    <table className="w-full border-collapse border border-black text-left">
                      <thead>
                        <tr className="border-b border-black bg-gray-100">
                          <th className="p-2">Rank</th>
                          <th className="p-2">Player Address</th>
                          <th className="p-2">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardData.map((player, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-400 bg-white"
                          >
                            <td className="p-2">
                              {index === 0
                                ? "🥇"
                                : index === 1
                                ? "🥈"
                                : index === 2
                                ? "🥉"
                                : index + 1}
                            </td>
                            <td className="p-2 font-semibold">
                              {player.player}
                            </td>{" "}
                            {/* Address instead of name */}
                            <td className="p-2">{Number(player.score)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <div>
                  <table className="w-full border-collapse border border-black text-left">
                    <thead>
                      <tr className="border-b border-black bg-gray-100">
                        <th className="p-2">Placement</th>
                        <th className="p-2">Prize</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prizeData.map((prize, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-400 bg-white"
                        >
                          <td className="p-2">{prize.rank}</td>
                          <td className="p-2">{prize.prize}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Prize Info Note */}
                  <p className="mt-4 text-xs italic text-center">
                    Note: These prizes are part of the game pool distribution.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GamePage;
