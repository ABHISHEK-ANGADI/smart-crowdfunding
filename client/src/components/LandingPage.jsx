import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  ShieldCheck,
  BadgePercent,
  Globe2,
  Zap,
  UsersRound,
  Wallet,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

const features = [
  {
    Icon: Eye,
    title: "100% Transparent",
    description:
      "All transactions are recorded on the blockchain, ensuring complete transparency and trust.",
  },
  {
    Icon: ShieldCheck,
    title: "Secure Escrow",
    description:
      "Funds are held in smart contracts and only released when campaign goals are met.",
  },
  {
    Icon: BadgePercent,
    title: "Zero Platform Fees",
    description: "We take no cut. You only pay standard Ethereum gas fees.",
  },
  {
    Icon: Globe2,
    title: "Global Access",
    description:
      "Anyone with an internet connection and a crypto wallet can participate, anywhere in the world.",
  },
  {
    Icon: Zap,
    title: "Instant Settlements",
    description:
      "No waiting for bank transfers. Funds move instantly on the blockchain.",
  },
  {
    Icon: UsersRound,
    title: "Community Governed",
    description:
      "The platform is open-source and governed by its community of users.",
  },
];

const LandingPage = ({ connectWallet, account }) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    if (account) {
      navigate("/dashboard");
    } else {
      connectWallet();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Main Content */}
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="text-indigo-600 dark:text-indigo-400">Fund The Future</span>
              <br />
              <span className="text-slate-900 dark:text-slate-100">Decentralized</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              The next-generation crowdfunding platform powered by blockchain
              technology. Launch campaigns, support innovations, and be part of
              the decentralized economy.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={connectWallet}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition text-lg shadow-lg inline-flex items-center justify-center gap-2"
              >
                <Wallet size={20} />
                Connect Wallet to Start
              </button>
              <button
                onClick={handleExplore}
                className="px-8 py-3 border border-slate-900 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium rounded-full transition text-lg inline-flex items-center justify-center gap-2"
              >
                <ArrowRight size={20} />
                Explore Campaigns
              </button>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mt-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Why Choose{" "}
                <span className="text-indigo-600">CrowdFund Pro</span>?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Experience the power of decentralized crowdfunding with
                unmatched transparency and security.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.Icon;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-8 card-shadow hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-700 group"
                  >
                    <div className="text-indigo-600 dark:text-indigo-400 mb-4 group-hover:text-indigo-700 transition">
                      <Icon size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">
                CrowdFund Pro
              </span>
              <span className="text-slate-400 text-sm">
                © {new Date().getFullYear()} All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition">
                About
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition">
                FAQ
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition">
                Docs
              </a>
            </div>
            <div className="flex space-x-4">
              <button
                aria-label="Discord"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition"
              >
                <MessageCircle size={18} />
              </button>
          
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;