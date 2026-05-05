import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  List,
  PlusCircle,
  FileText,
  HandCoins,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "all", label: "All Campaigns", icon: List, path: "/campaigns" },
  { id: "create", label: "Create Campaign", icon: PlusCircle, path: "/create" },
  { id: "my", label: "My Campaigns", icon: FileText, path: "/my-campaigns" },
  { id: "contributions", label: "My Contributions", icon: HandCoins, path: "/my-contributions" },
];

const Sidebar = ({ account, sidebarOpen, onClose }) => {
  return (
    <aside
      className={`
        fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 transform transition-transform duration-300 ease-in-out
        bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:sticky lg:translate-x-0 lg:shadow-none
      `}
    >
      <div className="p-5 flex flex-col h-full">
        {/* Wallet Info */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Connected Wallet</p>
          <p
            className="text-sm font-mono text-indigo-600 truncate dark:text-indigo-400"
            title={account}
          >
            {account
              ? `${account.slice(0, 6)}...${account.slice(-4)}`
              : "Not connected"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => onClose(false)}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;