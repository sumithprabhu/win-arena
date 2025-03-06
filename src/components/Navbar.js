import React from 'react';
import ConnectWalletButton from './ConnectWallet';

const Navbar = () => {
  return (
    <nav className="w-full bg-white border-b-[6px] border-black py-4 px-6 flex justify-between items-center text-black">
      {/* Left Side: Logo */}
      <div className="font-bold pixel-font text-3xl tracking-wide">
        WIN ARENA
      </div>

      {/* Right Side: Pixelated Connect Wallet Button */}
      <div className="relative">
        {/* Pixel Shadow (Fixed) */}
        <div className="absolute top-[6px] left-[6px] w-full h-full bg-black"></div>

        {/* Button (Moves on Click) */}
        <ConnectWalletButton />
      </div>
    </nav>
  );
};

export default Navbar;
