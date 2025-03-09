"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "./globals.css";
import { ToastContainer, toast, Bounce } from 'react-toastify';


const coreTestnet = {
  id: 1115,
  name: "Core Blockchain Testnet",
  iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/23254.png",
  iconBackground: "#fff",
  nativeCurrency: { name: "Core Testnet Token", symbol: "tCORE", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://core-testnet.drpc.org"] },
  },
  blockExplorers: {
    default: { name: "CoreScan", url: "https://scan.test.btcs.network/" },
  },
};
const config = getDefaultConfig({
  appName: "Win Arena",
  projectId: "30bede5f518fc2c9a9900ada7ef88888",
  chains: [coreTestnet],
  ssr: true,
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
              />
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
