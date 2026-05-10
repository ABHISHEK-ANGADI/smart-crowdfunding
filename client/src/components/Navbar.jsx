import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, Menu, X, LogOut, ShieldAlert, ChevronDown, Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = ({
  account,
  isConnecting,
  connectWallet,
  disconnectWallet,
  networkError,
  balance,
  onToggleSidebar,
  sidebarOpen,
}) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupOpen(false);
      }
    };
    if (popupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupOpen]);

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      toast.success("Address copied to clipboard");
    }
  };

  const openEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/address/${account}`, "_blank");
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setPopupOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-auto shadow-sm dark:bg-slate-900/90 dark:border-slate-700">
      {/* Network Error Banner */}
      {networkError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-800 text-sm flex items-center gap-2 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
          <ShieldAlert size={16} />
          {networkError}
        </div>
      )}

      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo + Hamburger */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-600">CrowdFund</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pro</span>
          </Link>
        </div>

        {/* Right Section: Wallet & Actions */}
        <div className="flex items-center gap-3">
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Wallet size={18} />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <>
              {/* Wallet Button with Popup */}
              <div className="relative" ref={popupRef}>
                <button
                  onClick={() => setPopupOpen(!popupOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-full border border-slate-200 text-slate-900 text-sm font-medium hover:bg-slate-200 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  <Wallet size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                  <ChevronDown size={14} className={`transition-transform ${popupOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Popup */}
                {popupOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Connected Wallet
                    </p>
                    <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all mb-2">
                      {account}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={copyAddress}
                        className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        title="Copy address"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={openEtherscan}
                        className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        title="View on Etherscan"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Balance</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {balance !== null ? `${balance} ETH` : "..."}
                      </p>
                    </div>
                    <hr className="mb-3 border-slate-200 dark:border-slate-700" />
                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;