import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';

const ConnectWalletButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    className="relative bg-yellow-400 text-black pixel-font text-sm px-4 py-2 border-[4px] border-black pixel-corners"
                    style={{ imageRendering: "pixelated" }} // Forces retro look
                    onMouseDown={(e) => e.currentTarget.style.transform = "translate(4px, 4px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translate(0px, 0px)"}
                    onClick={openConnectModal}
                  >
                    CONNECT WALLET
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    className="relative bg-red-500 text-white pixel-font text-xs px-4 py-2 border-[4px] border-black pixel-corners"
                    style={{ imageRendering: "pixelated" }}
                    onMouseDown={(e) => e.currentTarget.style.transform = "translate(4px, 4px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translate(0px, 0px)"}
                    onClick={openChainModal}
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <button
                  className="relative bg-white text-black pixel-font text-sm px-6 py-2 border-[4px] border-black pixel-corners  cursor-pointer"
                  style={{ imageRendering: "pixelated" }}
                  onMouseDown={(e) => e.currentTarget.style.transform = "translate(4px, 4px)"}
                  onMouseUp={(e) => e.currentTarget.style.transform = "translate(0px, 0px)"}
                  onClick={openAccountModal}
                >
                  {account.displayName.length > 6
  ? `${account.displayName.slice(0, 4)}...${account.displayName.slice(-3)}`
  : account.displayName}

                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletButton;
