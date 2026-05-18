import React, { useState, useMemo } from "react";
import { ethers } from "ethers";
import { X, TrendingUp, Clock, Target, User, CheckCircle2, AlertCircle, Ban, Info } from "lucide-react";

const CampaignModal = ({
  campaign,
  account,
  onClose,
  onFund,
  onClaim,
  onRefund,
  onCancel,
  userContribution,
}) => {
  const [fundAmount, setFundAmount] = useState("");
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
  const canCancel =
    isCreator &&
    isActive &&
    totalRaised === 0n &&
    !campaign.cancelled;

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

  // IPFS Gateway URLs with Pinata first, then fallbacks
  const GATEWAY_URLS = useMemo(() => [
    `https://gateway.pinata.cloud/ipfs/${campaign.imageCID}`,
    `https://ipfs.io/ipfs/${campaign.imageCID}`,
    `https://dweb.link/ipfs/${campaign.imageCID}`,
    `https://cloudflare-ipfs.com/ipfs/${campaign.imageCID}`,
  ], [campaign.imageCID]);

  const currentImageUrl = useMemo(() => {
    if (!campaign.imageCID || imageLoadFailed) return null;
    return GATEWAY_URLS[currentGatewayIndex];
  }, [campaign.imageCID, imageLoadFailed, currentGatewayIndex, GATEWAY_URLS]);

  const handleImageError = () => {
    if (currentGatewayIndex < GATEWAY_URLS.length - 1) {
      setCurrentGatewayIndex(currentGatewayIndex + 1);
    } else {
      setImageLoadFailed(true);
    }
  };

  const handleFund = () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) return;
    onFund(campaign.id, fundAmount);
    setFundAmount("");
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition z-10"
        >
          <X size={24} className="text-slate-500 dark:text-slate-400" />
        </button>

        {/* Campaign Image - edge‑to‑edge, no Pinata badge */}
        <div className="relative w-full h-64 flex-shrink-0">
          {currentImageUrl && !imageLoadFailed ? (
            <img
              src={currentImageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              {campaign.imageCID && imageLoadFailed && (
                <div className="text-white text-center">
                  <p>Image loading...</p>
                  <p className="text-xs opacity-80">May take 1-2 minutes</p>
                </div>
              )}
              {campaign.imageCID && (
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="absolute top-4 left-4 cursor-help"
                >
                  <Info size={20} className="text-white/80 hover:text-white" />
                  {showTooltip && (
                    <div className="absolute top-full left-0 mt-2 bg-slate-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-10">
                      IPFS images may take 1-2 minutes to propagate
                    </div>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Title & Creator */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {campaign.title}
            </h2>
            <div className="flex items-center gap-3">
              <User size={16} className="text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300">
                Creator: <span className="font-medium">{campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}</span>
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6 inline-block">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
              <StatusIcon
                size={18}
                className={
                  statusLabel === "Active" ? "text-amber-600" :
                  statusLabel === "Funded" || statusLabel === "Success" ? "text-teal-600" :
                  "text-slate-500 dark:text-slate-400"
                }
              />
              <span className={`font-semibold ${
                statusLabel === "Active" ? "text-amber-600" :
                statusLabel === "Funded" || statusLabel === "Success" ? "text-teal-600" :
                "text-slate-500 dark:text-slate-400"
              }`}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Funding Progress</span>
              <span className="text-sm font-medium text-teal-600">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Raised</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {ethers.formatEther(totalRaised)} ETH
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Target</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {ethers.formatEther(goal)} ETH
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Deadline</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {new Date(campaign.deadline * 1000).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Time Left</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isActive ? Math.ceil((campaign.deadline * 1000 - Date.now()) / (24 * 60 * 60 * 1000)) : 0} days
              </p>
            </div>
          </div>

          {/* Your Contribution */}
          {userContribution > 0n && !isCreator && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4 mb-8">
              <p className="text-sm text-indigo-900 dark:text-indigo-200">
                Your contribution: <span className="font-bold">{ethers.formatEther(userContribution)} ETH</span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Fund Input */}
            {isActive && !isCreator && !goalMet && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contribute to Campaign</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="Enter amount in ETH"
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleFund}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
                  >
                    Fund
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {canClaim && (
                <button
                  onClick={() => {
                    onClaim(campaign.id);
                    onClose();
                  }}
                  className="flex-1 min-w-[150px] px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-medium"
                >
                  Claim Funds
                </button>
              )}

              {canRefund && (
                <button
                  onClick={() => {
                    onRefund(campaign.id);
                    onClose();
                  }}
                  className="flex-1 min-w-[150px] px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition font-medium"
                >
                  Claim Refund
                </button>
              )}

              {canCancel && onCancel && (
                <button
                  onClick={() => {
                    onCancel(campaign.id);
                    onClose();
                  }}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium flex items-center gap-2"
                >
                  <Ban size={18} />
                  Cancel Campaign
                </button>
              )}

              {!isActive && !canClaim && !canRefund && !canCancel && !isCreator && (
                <div className="w-full text-center py-4 text-slate-500 dark:text-slate-400">
                  This campaign is no longer active
                </div>
              )}

              {isCreator && !isActive && !canClaim && (
                <div className="w-full text-center py-4 text-slate-500 dark:text-slate-400">
                  Campaign has ended
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignModal;