import React from "react";
import CampaignCard from "./CampaignCard";
import { ethers } from "ethers";
import { Flag, TrendingUp, Activity } from "lucide-react";

const MyCampaigns = ({ campaigns, account, onClaim, loading }) => {
  const myCampaigns = campaigns.filter(
    (c) => c.creator.toLowerCase() === account?.toLowerCase()
  );

  const totalRaised = myCampaigns.reduce(
    (acc, c) => acc + BigInt(c.totalRaised || "0"),
    0n
  );
  const activeCount = myCampaigns.filter(
    (c) => Date.now() / 1000 < c.deadline && !c.claimed
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">My Campaigns</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Manage and track your crowdfunding campaigns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm dark:shadow-slate-900/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
            <Flag size={16} /> Total Campaigns
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{myCampaigns.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm dark:shadow-slate-900/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
            <TrendingUp size={16} /> Total Raised
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {ethers.formatEther(totalRaised)} ETH
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm dark:shadow-slate-900/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
            <Activity size={16} /> Active Campaigns
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{activeCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : myCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            You haven't created any campaigns yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              account={account}
              onClaim={onClaim}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCampaigns;