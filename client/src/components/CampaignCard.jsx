import React, { useState, useMemo } from "react";
import { ethers } from "ethers";
import { X, Ban, TrendingUp, Clock, Target, User, CheckCircle2, AlertCircle, Info } from "lucide-react";

const CampaignCard = ({
  campaign,
  account,
  onFund,
  onClaim,
  onRefund,
  onCancel,
  onViewDetails,
  userContribution,
}) => {
  const [fundAmount, setFundAmount] = useState("");
  const [showFundInput, setShowFundInput] = useState(false);
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const goal = BigInt(campaign.goal || "0");
  const totalRaised = BigInt(campaign.totalRaised || "0");
  const progress = goal > 0n ? Number((totalRaised * 100n) / goal) : 0;
  const isActive = Date.now() / 1000 < campaign.deadline && !campaign.claimed;
  const isCreator = account?.toLowerCase() === campaign.creator.toLowerCase();
  const goalMet = totalRaised >= goal;
  const deadlinePassed = Date.now() / 1000 >= campaign.deadline;
  const canClaim = isCreator && deadlinePassed && goalMet && !campaign.claimed;
  const canRefund =
    !isCreator && deadlinePassed && !goalMet && userContribution > 0n;
  const canCancel = isCreator && isActive && totalRaised === 0n && !campaign.cancelled;

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

  const GATEWAY_URLS = useMemo(
    () => [
      `https://gateway.pinata.cloud/ipfs/${campaign.imageCID}`,
      `https://ipfs.io/ipfs/${campaign.imageCID}`,
      `https://dweb.link/ipfs/${campaign.imageCID}`,
      `https://cloudflare-ipfs.com/ipfs/${campaign.imageCID}`,
    ],
    [campaign.imageCID]
  );

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

  return (
    <div
      onClick={() => onViewDetails?.(campaign)}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/50 hover:shadow-md hover:scale-[1.01] transition cursor-pointer overflow-hidden flex flex-col h-full"
    >
      {/* Campaign Image - edge‑to‑edge */}
      <div className="w-full h-48 relative flex-shrink-0">
        {currentImageUrl && !imageLoadFailed ? (
          <img
            src={currentImageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="relative group w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            {campaign.imageCID && imageLoadFailed && (
              <div className="text-white text-center text-xs px-2">
                <p>Image loading...</p>
                <p className="text-xs opacity-80">May take 1-2 minutes</p>
              </div>
            )}
            {campaign.imageCID && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(!showTooltip);
                }}
                className="absolute top-2 left-2 cursor-help"
              >
                <Info size={16} className="text-white/80 hover:text-white" />
                {showTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 bg-slate-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-10">
                    IPFS images may take 1-2 minutes to propagate across all gateways
                  </div>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title & Creator */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
            {campaign.title}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ml-2">
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
          {isActive && !isCreator && !goalMet && (
            <>
              {!showFundInput ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFundInput(true);
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm"
                >
                  Fund
                </button>
              ) : (
                <div className="flex w-full gap-2" onClick={(e) => e.stopPropagation()}>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFund();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
                  >
                    Send
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFundInput(false);
                    }}
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
              onClick={(e) => {
                e.stopPropagation();
                onClaim(campaign.id);
              }}
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition text-sm"
            >
              Claim Funds
            </button>
          )}

          {canRefund && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefund(campaign.id);
              }}
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition text-sm"
            >
              Refund
            </button>
          )}

          {canCancel && onCancel && (
            <button
              type="button"
              title="Cancel Campaign"
              aria-label="Cancel Campaign"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(campaign.id);
              }}
              className="p-2 rounded-lg bg-transparent text-amber-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm inline-flex items-center justify-center"
            >
              <Ban size={18} />
            </button>
          )}

          {isCreator && isActive && (
            <span className="flex-1 text-center text-sm text-slate-500 py-2">
              Your Campaign
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;