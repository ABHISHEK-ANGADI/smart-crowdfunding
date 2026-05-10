import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Coins, Heart, BarChart3, ExternalLink } from "lucide-react"; // ← added ExternalLink

const MyContributions = ({ contract, account, campaigns }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      if (!contract || !account) return;
      setLoading(true);
      try {
        const contributedCampaigns = [];
        for (const campaign of campaigns) {
          const amount = await contract.getContribution(campaign.id, account);
          if (amount > 0n) {
            contributedCampaigns.push({
              ...campaign,
              contributed: amount.toString(),
            });
          }
        }
        setContributions(contributedCampaigns);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchContributions();
  }, [contract, account, campaigns]);

  const totalContributed = contributions.reduce(
    (acc, c) => acc + BigInt(c.contributed || "0"),
    0n
  );
  const projectsSupported = contributions.length;
  const averageContribution =
    projectsSupported > 0 ? totalContributed / BigInt(projectsSupported) : 0n;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">My Contributions</h2>
        <p className="text-slate-600 dark:text-slate-400">Track your support for innovative projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm dark:shadow-slate-900/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
            <Coins size={16} /> Total Contributed
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {ethers.formatEther(totalContributed)} ETH
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm dark:shadow-slate-900/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
            <Heart size={16} /> Projects Supported
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{projectsSupported}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm dark:shadow-slate-900/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
            <BarChart3 size={16} /> Average Contribution
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {ethers.formatEther(averageContribution)} ETH
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : contributions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            You haven't contributed to any campaigns yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contributions.map((campaign) => {
            const goal = BigInt(campaign.goal || "0");
            const raised = BigInt(campaign.totalRaised || "0");
            const progress = goal > 0n ? Number((raised * 100n) / goal) : 0;
            return (
              <div
                key={campaign.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm dark:shadow-slate-900/50"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      by {campaign.creator?.slice(0, 6)}...
                      {campaign.creator?.slice(-4)}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Contributed:{" "}
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {ethers.formatEther(campaign.contributed)} ETH
                        </span>
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        Progress:{" "}
                        <span className="text-teal-600 font-medium">
                          {progress.toFixed(1)}%
                        </span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.claimed
                            ? "bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-200"
                            : Date.now() / 1000 < campaign.deadline
                            ? "bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-200"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {campaign.claimed
                          ? "Funded"
                          : Date.now() / 1000 < campaign.deadline
                          ? "Active"
                          : "Ended"}
                      </span>
                    </div>
                  </div>

                  {/* Etherscan link */}
                  <button
                    onClick={() =>
                      window.open(
                        `https://sepolia.etherscan.io/address/${account}`,
                        "_blank"
                      )
                    }
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    title="View your transactions on Etherscan"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyContributions;