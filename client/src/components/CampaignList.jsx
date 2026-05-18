import React from "react";
import CampaignCard from "./CampaignCard";
import CampaignModal from "./CampaignModal";
import { Search } from "lucide-react";

const CampaignList = ({
  campaigns,
  loading,
  account,
  onFund,
  onClaim,
  onRefund,
  onCancel,
  getUserContribution,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filter, setFilter] = React.useState("all"); // all, active, my
  const [selectedCampaign, setSelectedCampaign] = React.useState(null);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isActive = Date.now() / 1000 < c.deadline && !c.claimed;
    if (filter === "active") return matchesSearch && isActive;
    if (filter === "my")
      return (
        matchesSearch &&
        c.creator.toLowerCase() === account?.toLowerCase()
      );
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse"
          >
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "my"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 text-lg">No campaigns found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              account={account}
              onFund={onFund}
              onClaim={onClaim}
              onRefund={onRefund}
              onCancel={onCancel}
              onViewDetails={setSelectedCampaign}
              userContribution={getUserContribution?.(campaign.id, account) || 0n}
            />
          ))}
        </div>
      )}

      {selectedCampaign && (
        <CampaignModal
          campaign={selectedCampaign}
          account={account}
          onClose={() => setSelectedCampaign(null)}
          onFund={onFund}
          onClaim={onClaim}
          onRefund={onRefund}
          onCancel={onCancel}
          userContribution={getUserContribution?.(selectedCampaign.id, account) || 0n}
        />
      )}
    </div>
  );
};

export default CampaignList;