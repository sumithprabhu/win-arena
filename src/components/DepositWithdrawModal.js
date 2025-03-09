import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt,useReadContract,useAccount } from "wagmi";
import { toast } from "react-toastify";
import { contractABI, contractAddress } from "../constants/winArenaContractConfig";
import { stableContractABI, stableContractAddress } from "../constants/stableCoinConfig";

const DepositWithdrawModal = ({ closeModal }) => {
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [approved, setApproved] = useState(false);
  const { address } = useAccount(); // Get user address


  const parsedAmount = BigInt(Number(amount) * 10 ** 6); // Convert input to 10^6

  const { data: approvalHash, writeContract: approveToken } = useWriteContract();
  const { isLoading: isApproving, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const { data: depositHash, writeContract: depositWin } = useWriteContract();
  const { isLoading: isDepositing, isSuccess: isDepositDone } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const { data: withdrawHash, writeContract: withdrawWin } = useWriteContract();
  const { isLoading: isWithdrawing, isSuccess: isWithdrawDone } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });
  
  const { data: winBalance, isLoading, error,refetch } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "users",
    args: [address], // Pass the user's wallet address
    query: { enabled: !!address}, // Fetch when address exists or deposit is done
  });

  useEffect(() => {
    if (isDepositDone) {
      refetch(); // Trigger refetch when deposit is completed
    }
  }, [isDepositDone]);

  // ✅ Handle Approval with Loader
  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      toast.info("Approval transaction sent...");

      approveToken({
        address: stableContractAddress,
        abi: stableContractABI,
        functionName: "approve",
        args: [contractAddress, parsedAmount],
      });
    } catch (error) {
      console.error("Error approving token:", error);
      toast.error("Approval failed!");
      setIsProcessing(false);
    }
  };

  // ✅ Handle Deposit with Loader
  const handleDeposit = async () => {
    if (!approved) return toast.warn("Please approve first!");

    try {
      setIsProcessing(true);
      toast.info("Depositing USDC...");

      depositWin({
        address: contractAddress,
        abi: contractABI,
        functionName: "depositStablecoin",
        args: [parsedAmount],
      });
    } catch (error) {
      console.error("Deposit failed:", error);
      toast.error("Deposit failed!");
      setIsProcessing(false);
    }
  };

  // ✅ Handle Withdrawal with Loader
  const handleWithdraw = async () => {
    try {
      setIsProcessing(true);
      toast.info("Withdrawing WIN...");

      withdrawWin({
        address: contractAddress,
        abi: contractABI,
        functionName: "withdrawStablecoin",
        args: [amount],
      });
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error("Withdrawal failed!");
      setIsProcessing(false);
    }
  };

  // ✅ Handle Transaction Completion
  useEffect(() => {
    if (isApproved) {
      setApproved(true);
      setIsProcessing(false);
      toast.success("Approval successful! Now deposit.");
    }
  }, [isApproved]);

  useEffect(() => {
    if (isDepositDone) {
      setIsProcessing(false);
      toast.success("Deposit successful! WIN balance updated.");
      setAmount(""); // Reset input
    }
  }, [isDepositDone]);

  useEffect(() => {
    if (isWithdrawDone) {
      setIsProcessing(false);
      toast.success("Withdrawal successful! USDC balance updated.");
      setAmount(""); // Reset input
    }
  }, [isWithdrawDone]);

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-black/40 z-100" onClick={closeModal}>
      <div className="relative bg-white border-[4px] border-black p-6 pixel-corners w-[400px]" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-black text-lg font-bold" onClick={closeModal}>✕</button>

        {/* Balance & Conversion */}
        <div className="text-center mb-4">
          <p className="font-bold text-lg">Balance: {winBalance} WIN</p>
          <p className="text-sm italic">1 USDC = 10 WIN</p>
        </div>

        {/* Toggle */}
        <div className="flex">
          <button className={`w-1/2 py-2 text-lg font-bold border-[4px] border-black pixel-corners cursor-pointer ${activeTab === "deposit" ? "bg-yellow-400" : "bg-white"}`} onClick={() => setActiveTab("deposit")}>
            Deposit
          </button>
          <button className={`w-1/2 py-2 text-lg font-bold border-[4px] border-black pixel-corners cursor-pointer ${activeTab === "withdraw" ? "bg-yellow-400" : "bg-white"}`} onClick={() => setActiveTab("withdraw")}>
            Withdraw
          </button>
        </div>

        {/* Deposit */}
        {activeTab === "deposit" && (
          <div className="mt-4">
            <label className="block font-bold mb-2">Enter USDC</label>
            <div className="relative border-[4px] border-black px-3 py-2 flex justify-between items-center">
              <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full outline-none bg-transparent no-spinner" />
              <span className="text-gray-500">USDC</span>
            </div>
            <div className="mt-2 border-[4px] border-black px-3 py-2 text-center">You Get: {amount * 10} WIN</div>

            {/* Approve Button */}
            {!approved && (
              <button className="relative w-full mt-4 bg-yellow-400 text-black text-lg px-4 py-2 border-[4px] border-black" onClick={handleApprove} disabled={isProcessing || isApproving}>
                {isProcessing || isApproving ? "Approving..." : "Approve Token"}
              </button>
            )}

            {/* Deposit Button */}
            {approved && (
              <button className="relative w-full mt-4 bg-yellow-400 text-black text-lg px-4 py-2 border-[4px] border-black" onClick={handleDeposit} disabled={isProcessing || isDepositing}>
                {isProcessing || isDepositing ? "Depositing..." : "Deposit"}
              </button>
            )}
          </div>
        )}

        {/* Withdraw */}
        {activeTab === "withdraw" && (
          <div className="mt-4">
            <label className="block font-bold mb-2">Enter WIN</label>
            <div className="relative border-[4px] border-black px-3 py-2 flex justify-between items-center">
              <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full outline-none bg-transparent no-spinner" />
              <span className="text-gray-500">WIN</span>
            </div>
            <div className="mt-2 border-[4px] border-black px-3 py-2 text-center">You Get: {amount / 10} USDC</div>

            {/* Withdraw Button */}
            <button className="relative w-full mt-4 bg-yellow-400 text-black text-lg px-4 py-2 border-[4px] border-black" onClick={handleWithdraw} disabled={isProcessing || isWithdrawing}>
              {isProcessing || isWithdrawing ? "Withdrawing..." : "Withdraw"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositWithdrawModal;
