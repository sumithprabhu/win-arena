import { useState } from "react";

const DepositWithdrawModal = ({ closeModal }) => {
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState("");

  // Convert USDC to WIN (1 USDC = 10 WIN)
  const convertedAmount =
    activeTab === "deposit"
      ? (Number(amount) * 10).toFixed(2)
      : (Number(amount) / 10).toFixed(2);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-black/40 z-100"
      onClick={closeModal} // Close modal when clicking on the background
    >
      {/* Modal Container (Stops Click Propagation) */}
      <div
        className="relative bg-white border-[4px] border-black p-6 pixel-corners w-[400px]"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking inside modal
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-black text-lg font-bold"
          onClick={closeModal}
        >
          ✕
        </button>

        {/* Balance & Conversion Rate */}
        <div className="text-center mb-4">
          <p className="font-bold text-lg">Balance: 0 WIN</p>
          <p className="text-sm italic">1 USDC = 10 WIN</p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex">
          <button
            className={`w-1/2 py-2 text-center text-lg font-bold border-[4px] border-black pixel-corners  cursor-pointer ${
              activeTab === "deposit" ? "bg-yellow-400" : "bg-white"
            }`}
            onClick={() => setActiveTab("deposit")}
          >
            Deposit
          </button>
          <button
            className={`w-1/2 py-2 text-center text-lg font-bold border-[4px] border-black pixel-corners  cursor-pointer ${
              activeTab === "withdraw" ? "bg-yellow-400" : "bg-white"
            }`}
            onClick={() => setActiveTab("withdraw")}
          >
            Withdraw
          </button>
        </div>

        {/* Deposit Section */}
        {activeTab === "deposit" && (
          <div className="mt-4">
            <label className="block font-bold mb-2">Enter USDC</label>
            <div className="relative border-[4px] border-black px-3 py-2 flex justify-between items-center">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full outline-none bg-transparent no-spinner"
              />
              <span className="text-gray-500">USDC</span>
            </div>

            {/* Converted Amount */}
            <div className="mt-2 border-[4px] border-black px-3 py-2 text-center">
              You Get: {convertedAmount} WIN
            </div>

            {/* Deposit Button */}
            <div className="relative w-full mt-4">
              {/* Shadow effect */}
              <div className="absolute top-[5px] left-[4px] w-full h-full bg-black -z-10"></div>

              <button
                className="relative w-full bg-yellow-400 text-black pixel-font text-lg px-4 py-2 border-[4px] border-black "
                style={{ imageRendering: "pixelated" }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "translate(4px, 4px)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "translate(0px, 0px)")
                }
              >
                Deposit
              </button>
            </div>
          </div>
        )}

        {/* Withdraw Section */}
        {activeTab === "withdraw" && (
          <div className="mt-4">
            <label className="block font-bold mb-2">Enter WIN</label>
            <div className="relative border-[4px] border-black px-3 py-2 flex justify-between items-center">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full outline-none bg-transparent no-spinner"
              />
              <span className="text-gray-500">WIN</span>
            </div>

            {/* Converted Amount */}
            <div className="mt-2 border-[4px] border-black px-3 py-2 text-center">
              You Get: {convertedAmount} USDC
            </div>

            {/* Withdraw Button */}
            <div className="relative w-full mt-4">
              {/* Shadow effect */}
              <div className="absolute top-[5px] left-[4px] w-full h-full bg-black -z-10"></div>

              <button
                className="relative w-full bg-yellow-400 text-black pixel-font text-lg px-4 py-2 border-[4px] border-black "
                style={{ imageRendering: "pixelated" }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "translate(4px, 4px)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "translate(0px, 0px)")
                }
              >
                Withdraw
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositWithdrawModal;
