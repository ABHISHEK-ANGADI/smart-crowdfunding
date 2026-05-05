import React from "react";
import { ethers } from "ethers";
import { PlusCircle, Search } from "lucide-react";

const DashboardPage = ({ account, campaigns, contributionsCount }) => {
  const totalCampaigns = campaigns.length;
  const totalRaised = campaigns.reduce(
    (acc, c) => acc + BigInt(c.totalRaised),
    0n
  );
  const activeCampaigns = campaigns.filter(
    (c) => Date.now() / 1000 < c.deadline && !c.claimed
  ).length;
  const successfulCampaigns = campaigns.filter((c) => c.claimed).length;

  const myCampaigns = campaigns.filter(
    (c) => c.creator.toLowerCase() === account?.toLowerCase()
  ).length;

  const stats = [
    {
      label: "Total Campaigns",
      value: totalCampaigns,
    },
    {
      label: "Total Raised",
      value: `${ethers.formatEther(totalRaised)} ETH`,
    },
    {
      label: "Active Campaigns",
      value: activeCampaigns,
    },
    {
      label: "Successful Campaigns",
      value: successfulCampaigns,
    },
    {
      label: "My Campaigns",
      value: myCampaigns,
    },
    {
      label: "My Contributions",
      value: contributionsCount,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Overview of platform activity and your contributions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-slate-900/50">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/campaigns"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm inline-flex items-center gap-2"
          >
            <Search size={16} />
            Browse Campaigns
          </a>
          <a
            href="/create"
            className="px-4 py-2 border border-slate-900 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition text-sm inline-flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Create Campaign
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;