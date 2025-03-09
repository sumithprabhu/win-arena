import React, { useEffect, useState } from "react";
import "./style.css";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  contractABI,
  contractAddress,
} from "../../constants/winArenaContractConfig";
import { useRouter, usePathname } from "next/navigation"; // Import Next.js router

function App() {
  const [score, setScore] = useState(0); // React state for the score
  const { address } = useAccount(); // Get connected user's address
  const router = useRouter();
  const pathname = usePathname(); // For App Router
  const [isGameOver, setIsGameOver] = useState(true);
  const [isScoreUpdated, setIsScoreUpdated] = useState(false);
  const { data:updateHash,writeContract } = useWriteContract();
  const { isLoading: isUpdating, isSuccess: updateSuccess } =
    useWaitForTransactionReceipt({
      hash: updateHash,
    });

    useEffect(() => {
      if (updateSuccess) {
        refetch();
      }
    }, [updateSuccess]);

  const updateScore = async () => {
    try {
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "updateScore",
        args: [0, score], // gameId 0 and new score
      });
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  useEffect(() => {
    if (isGameOver) {
      const currentScore = parseInt(score, 10) || 0;
      const highestScore = parseInt(heighestScore, 10) || 0;
  
      if (currentScore > highestScore) {
        updateScore(); 
        setIsScoreUpdated(true);
      } else {
        setIsScoreUpdated(false);
      }
    }
  }, [isGameOver]);
  

  useEffect(() => {
    const restartButton = document.getElementById("restart");

    if (!restartButton) return;

    const checkVisibility = () => {
      setIsGameOver(restartButton.style.display === "block");
    };

    // MutationObserver to track changes in restart button visibility
    const observer = new MutationObserver(() => {
      checkVisibility();
    });

    observer.observe(restartButton, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // Initial check in case it's already visible
    checkVisibility();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Use a unique key for this specific route
    const reloadKey = `hasReloaded_${pathname}`;
    const hasReloaded = sessionStorage.getItem(reloadKey);

    if (!hasReloaded) {
      const timer = setTimeout(() => {
        sessionStorage.setItem(reloadKey, "true");
        router.refresh(); // App Router
        // router.reload(); // Pages Router - uncomment if using Pages Router
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    // Dynamically load script.js
    const script = document.createElement("script");
    script.src = "/script.js"; // Path from public folder
    script.async = true;
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const {
    data: heighestScore,
    isLoading,
    error,
    refetch
  } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "userScores",
    args: [0, address], // gameId 0 and user address
  });

  useEffect(() => {
    // Function to handle ESC key press
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        router.push("/jump-mountains"); // Navigate to /jump-mountains on ESC
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  useEffect(() => {
    const scoreElement = document.getElementById("score");

    if (!scoreElement) {
      console.error("Score element not found!");
      return;
    }

    // Function to update the score state when #score changes
    const updateScore = () => {
      const newScore = parseInt(scoreElement.innerText, 10) || 0;
      setScore(newScore);
    };

    // MutationObserver to track changes in #score
    const observer = new MutationObserver(() => {
      updateScore(); // Update score in React when it changes in script.js
    });

    observer.observe(scoreElement, { childList: true, subtree: true });

    // Initial update in case the score already exists
    updateScore();

    return () => observer.disconnect(); // Cleanup observer when unmounting
  }, []);

  return (
    <div style={{ width: "375px", margin: "0 auto" }}>
      <div className="container">
        <div
          className="absolute top-2 left-2 bg-white border-[4px] border-black p-5 pixel-corners text-md text-black "
          style={{ width: "250px", zIndex: 10 }} // Ensuring it's visible
        >
          <p className="font-bold text-center">Instructions</p>

          <ul className="text-xs list-disc pl-3">
            <li>
              Press <b>SPACE</b> to change map
            </li>
            {}
            <li>
              Press <b>ESC</b> to return home
            </li>
            <li>Highest score updates automatically</li>
            <li>Click to start & stop stick length</li>
            <li>Play unlimited times, highest score matters!</li>
            <li>
              Land on{" "}
              <span className="text-red-500 font-bold">middle (Red)</span> part
              to get double points!
            </li>
          </ul>
        </div>
        <div id="score"></div>
        <div className="absolute top-8 right-[100px] bg-white border-[4px] border-[#659F1C] text-[#659F1C] font-bold px-4 py-2 rounded-lg">
          Highest Score: {heighestScore ?? 0}
        </div>

        <canvas id="game" width="375" height="375"></canvas>
        <div id="introduction">Hold down the mouse to stretch out a stick</div>
        <div id="perfect">DOUBLE SCORE</div>
        {isGameOver && (
          <div className="absolute top-[250px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-[4px] border-[#659F1C] text-[#659F1C] p-5 pixel-corners text-center w-[300px]">
            {isScoreUpdated ? (
              <>
                <p className="font-bold text-lg">🎉 Congratulations! 🎉</p>
                <p className="mt-2">
                  You beat your previous high score! A signing popup will appear
                  to update your score.
                </p>
                <p className="mt-2 font-bold">
                  Let’s keep the momentum going! 🚀
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-lg text-red-500">Try Again!</p>
                <p className="mt-2">
                  You could not pass your highest score, so no score update.
          
                </p>
              </>
            )}
          </div>
        )}

        <button id="restart">RESTART</button>
      </div>
    </div>
  );
}

export default App;
