import React, { useState } from "react";
import { Lightbulb } from "lucide-react";

const CreateCampaign = ({ onCreate, isCreating }) => {
  const [formData, setFormData] = useState({
    title: "",
    goal: "",
    duration: "30",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.goal || !formData.duration) return;
    await onCreate(formData.title, formData.goal, parseFloat(formData.duration));
    setFormData({ title: "", goal: "", duration: "30" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm dark:shadow-slate-900/50">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Create New Campaign
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Launch your crowdfunding campaign and bring your ideas to life
        </p>

        {/* Gas fee notice */}
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg flex items-start gap-3">
          <Lightbulb size={18} className="text-indigo-600 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Creating a campaign requires a small gas fee paid to the Ethereum
            network. No platform fees are charged.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Campaign Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter a compelling title for your campaign"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Describe your campaign, goals, and how funds will be used"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Description is stored off-chain (demo only)
            </p>
          </div>

          {/* Target Amount & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target Amount (ETH) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Duration (Days) *
              </label>
              <input
                type="number"
                step="any"
                min="0.001"
                required
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;