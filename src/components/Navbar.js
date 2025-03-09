import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReadContract, useAccount } from "wagmi"; // Import wagmi hooks
import ConnectWalletButton from "./ConnectWallet";
import DepositWithdrawModal from "./DepositWithdrawModal"; 
import { contractABI, contractAddress } from "../constants/winArenaContractConfig"; // Import contract details

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { address } = useAccount(); // Get user address

  // Fetch user's WIN balance using the contract's `users` mapping
  const { data: winBalance, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "users",
    args: [address], // Pass the user's wallet address
    query: { enabled: !!address }, // Only fetch if address exists
  });

  return (
    <nav className="w-full bg-white border-b-[5px] border-black py-4 px-6 flex justify-between items-center text-black relative">
      {/* Left Side: Logo */}
      <div 
        className="font-bold pixel-font text-3xl tracking-wide cursor-pointer"
        onClick={() => router.push("/")}
      >
        WIN ARENA
      </div>

      {/* Right Side: Balance + Connect Button */}
      <div className="flex items-center gap-4">
        {/* Balance Display Box (Clickable) */}
        <div
          className="relative border-[4px] border-black px-4 py-2 pixel-corners cursor-pointer bg-white text-sm pixel-font"
          onClick={() => setIsModalOpen(true)}
        >
          {isLoading ? "Loading..." : error ? "Error" : `${winBalance || 0} WIN`}
        </div>

        {/* Connect Wallet Button */}
        <ConnectWalletButton />
      </div>

      {/* Deposit/Withdraw Modal */}
      {isModalOpen && <DepositWithdrawModal closeModal={() => setIsModalOpen(false)} />}
    </nav>
  );
};

export default Navbar;
