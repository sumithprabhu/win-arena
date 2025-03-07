import { useState } from "react";
import { useRouter } from "next/navigation";
import ConnectWalletButton from "./ConnectWallet";
import DepositWithdrawModal from "./DepositWithdrawModal"; // Import the modal

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();


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
          0 WIN
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
