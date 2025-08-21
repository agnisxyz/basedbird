"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Game } from "./components/Game";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          onClick={handleAddFrame}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
        >
          🖼️ Save Frame
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-2 text-sm font-medium text-green-500 animate-pulse">
          <span>✅ Kaydedildi</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-indigo-500/30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="text-3xl transform scale-x-[-1]" style={{ filter: 'hue-rotate(240deg) saturate(2) brightness(1.2)' }}>🐦</div>
              <div>
                <h1 className="text-2xl font-bold text-white">Based Bird</h1>
              </div>
            </div>

            {/* Wallet & Frame */}
            <div className="flex items-center space-x-4">
              <Wallet className="z-10">
                <ConnectWallet>
                  <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200">
                    <Name className="text-inherit" />
                  </button>
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2 bg-gray-900 rounded-lg" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
              
              {saveFrameButton}
            </div>
          </div>
        </div>
      </header>

      {/* Main Game */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-4xl mx-auto px-4">
          <Game />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 border-t border-indigo-500/30 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              🚀 Developed on Base network
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => openUrl("https://base.org")}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Base.org
              </button>
              <button
                onClick={() => openUrl("https://farcaster.xyz")}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Farcaster
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
