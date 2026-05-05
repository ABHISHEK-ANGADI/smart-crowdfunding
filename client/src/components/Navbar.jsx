import React from "react";
import { Link } from "react-router-dom";
import { Wallet, Menu, X, LogOut, ShieldAlert, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext.jsx";

const Navbar = ({
  account,
  isConnecting,
  connectWallet,
  disconnectWallet,
  networkError,
  onToggleSidebar,
  sidebarOpen,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 h-auto shadow-sm dark:shadow-slate-900/50">
      {/* Network Error Banner */}
      {networkError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700 px-4 py-2 text-red-800 dark:text-red-100 text-sm flex items-center gap-2">
          <ShieldAlert size={16} />
          {networkError}
        </div>
      )}

      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo + Hamburger */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              CrowdFund
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pro</span>
          </Link>
        </div>

        {/* Right Section: Wallet & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

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
              {/* Wallet Pill with full address on hover */}
              <div
                className="px-4 py-2 bg-slate-100 rounded-full border border-slate-200 text-slate-900 text-sm font-medium cursor-default dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                title={account}
              >
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>

              {/* Disconnect Button */}
              <button
                onClick={disconnectWallet}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                title="Disconnect wallet"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;