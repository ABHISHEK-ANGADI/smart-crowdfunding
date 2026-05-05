import React, { useState } from "react";
import { ethers } from "ethers";
import { X, TrendingUp, Clock, Target, User, CheckCircle2, AlertCircle } from "lucide-react";

const CampaignCard = ({
  campaign,
  account,
  onFund,
  onClaim,
  onRefund,
  userContribution,
}) => {
  const [fundAmount, setFundAmount] = useState("");
  const [showFundInput, setShowFundInput] = useState(false);

  // Safe BigInt conversions
  const goal = BigInt(campaign.goal || "0");
  const totalRaised = BigInt(campaign.totalRaised || "0");
  const progress = goal > 0n ? Number((totalRaised * 100n) / goal) : 0;
  const isActive =
    Date.now() / 1000 < campaign.deadline && !campaign.claimed;
  const isCreator = account?.toLowerCase() === campaign.creator.toLowerCase();
  const goalMet = totalRaised >= goal;
  const deadlinePassed = Date.now() / 1000 >= campaign.deadline;
  const canClaim = isCreator && deadlinePassed && goalMet && !campaign.claimed;
  const canRefund =
    !isCreator &&
    deadlinePassed &&
    !goalMet &&
    userContribution > 0n;

  const handleFund = () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) return;
    onFund(campaign.id, fundAmount);
    setFundAmount("");
    setShowFundInput(false);
  };

  const statusLabel = campaign.claimed
    ? "Funded"
    : isActive
    ? "Active"
    : deadlinePassed && goalMet
    ? "Success"
    : "Failed";

  const StatusIcon = campaign.claimed
    ? CheckCircle2
    : isActive
    ? TrendingUp
    : deadlinePassed && goalMet
    ? CheckCircle2
    : AlertCircle;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/50 hover:shadow-md transition p-5 flex flex-col">
      {/* Title & Creator */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
          {campaign.title}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full whitespace-nowrap">
          <User size={12} className="inline mr-1" />
          {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500 dark:text-slate-400">Progress</span>
          <span className="text-teal-600 font-medium">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><TrendingUp size={14} /> Raised</p>
          <p className="text-slate-900 dark:text-slate-100 font-medium">
            {ethers.formatEther(totalRaised)} ETH
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Target size={14} /> Target</p>
          <p className="text-slate-900 dark:text-slate-100 font-medium">
            {ethers.formatEther(goal)} ETH
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock size={14} /> Deadline</p>
          <p className="text-slate-900 dark:text-slate-100 font-medium">
            {new Date(campaign.deadline * 1000).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><StatusIcon size={14} /> Status</p>
          <p className={`font-medium ${
            statusLabel === "Active" ? "text-amber-600" :
            statusLabel === "Funded" || statusLabel === "Success" ? "text-teal-600" :
            "text-slate-500 dark:text-slate-400"
          }`}>
            {statusLabel}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-wrap gap-2">
        {isActive && !isCreator && (
          <>
            {!showFundInput ? (
              <button
                onClick={() => setShowFundInput(true)}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm"
              >
                Fund
              </button>
            ) : (
              <div className="flex w-full gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="ETH"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleFund}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
                >
                  Send
                </button>
                <button
                  onClick={() => setShowFundInput(false)}
                  className="px-3 py-2 text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {canClaim && (
          <button
            onClick={() => onClaim(campaign.id)}
            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition text-sm"
          >
            Claim Funds
          </button>
        )}

        {canRefund && (
          <button
            onClick={() => onRefund(campaign.id)}
            className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition text-sm"
          >
            Refund
          </button>
        )}

        {isCreator && isActive && (
          <span className="flex-1 text-center text-sm text-slate-500 py-2">
            Your Campaign
          </span>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;