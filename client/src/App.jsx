import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import CampaignList from "./components/CampaignList";
import CreateCampaign from "./components/CreateCampaign";
import MyCampaigns from "./components/MyCampaigns";
import MyContributions from "./components/MyContributions";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./components/DashboardPage";
import { useContract } from "./hooks/useContract";

// Layout wrapper for authenticated pages – includes sidebar
function AuthenticatedLayout({ account, sidebarOpen, onToggleSidebar, children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => onToggleSidebar(false)}
        />
      )}

      <Sidebar
        account={account}
        sidebarOpen={sidebarOpen}
        onClose={() => onToggleSidebar(false)}
      />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function App() {
  const {
    account,
    isConnecting,
    connectWallet,
    disconnectWallet,
    contract,
    campaigns,
    loading,
    networkError,
    balance, 
    fetchCampaigns,
    createCampaign,
    contribute,
    claimFunds,
    refund,
    cancelCampaign,
    getUserContribution,
  } = useContract();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contributionsCount, setContributionsCount] = useState(0);

  // Fetch campaigns when contract is ready
  React.useEffect(() => {
    if (contract) {
      fetchCampaigns();
    }
  }, [contract, fetchCampaigns]);

  // Calculate how many unique campaigns the user contributed to
  React.useEffect(() => {
    if (!contract || !account) return;
    const fetchContributionsCount = async () => {
      let count = 0;
      for (const campaign of campaigns) {
        try {
          const amount = await contract.getContribution(campaign.id, account);
          if (amount > 0n) count++;
        } catch (error) {
          console.error(`Error fetching contribution for campaign ${campaign.id}`, error);
        }
      }
      setContributionsCount(count);
    };
    fetchContributionsCount();
  }, [contract, account, campaigns]);

  function LoadingSpinner() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--toast-bg)",
              color: "var(--toast-text)",
              border: "1px solid var(--toast-border)",
            },
            success: {
              iconTheme: {
                primary: "#4F46E5",
                secondary: "#fff",
              },
            },
          }}
        />
        <Navbar
          account={account}
          isConnecting={isConnecting}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          networkError={networkError}
          balance={balance}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <Routes>
          {/* Public Landing */}
          <Route
            path="/"
            element={
              !account ? (
                <LandingPage connectWallet={connectWallet} account={account} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Protected Routes – All with Sidebar */}
          <Route
            path="/dashboard"
            element={
              account ? (
                <AuthenticatedLayout
                  account={account}
                  sidebarOpen={sidebarOpen}
                  onToggleSidebar={setSidebarOpen}
                >
                  <DashboardPage
                    account={account}
                    campaigns={campaigns}
                    contributionsCount={contributionsCount}
                  />
                </AuthenticatedLayout>
              ) : isConnecting ? (
                <LoadingSpinner />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/campaigns"
            element={
              account ? (
                <AuthenticatedLayout
                  account={account}
                  sidebarOpen={sidebarOpen}
                  onToggleSidebar={setSidebarOpen}
                >
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      Discover Campaigns
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                      Discover amazing projects, support innovative ideas.
                    </p>
                    <CampaignList
                      campaigns={campaigns}
                      loading={loading}
                      account={account}
                      onFund={contribute}
                      onClaim={claimFunds}
                      onRefund={refund}
                      onCancel={cancelCampaign}
                      getUserContribution={getUserContribution}
                    />
                  </div>
                </AuthenticatedLayout>
              ) : isConnecting ? (
                <LoadingSpinner />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/create"
            element={
              account ? (
                <AuthenticatedLayout
                  account={account}
                  sidebarOpen={sidebarOpen}
                  onToggleSidebar={setSidebarOpen}
                >
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      Launch New Campaign
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                      Bring your ideas to life with blockchain funding.
                    </p>
                    <CreateCampaign onCreate={createCampaign} isCreating={loading} />
                  </div>
                </AuthenticatedLayout>
              ) : isConnecting ? (
                <LoadingSpinner />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/my-campaigns"
            element={
              account ? (
                <AuthenticatedLayout
                  account={account}
                  sidebarOpen={sidebarOpen}
                  onToggleSidebar={setSidebarOpen}
                >
                  <MyCampaigns
                    campaigns={campaigns}
                    account={account}
                    onClaim={claimFunds}
                    onCancel={cancelCampaign}
                    loading={loading}
                  />
                </AuthenticatedLayout>
              ) : isConnecting ? (
                <LoadingSpinner />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/my-contributions"
            element={
              account ? (
                <AuthenticatedLayout
                  account={account}
                  sidebarOpen={sidebarOpen}
                  onToggleSidebar={setSidebarOpen}
                >
                  <MyContributions
                    contract={contract}
                    account={account}
                    campaigns={campaigns}
                  />
                </AuthenticatedLayout>
              ) : isConnecting ? (
                <LoadingSpinner />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catch-all: redirect to dashboard if logged in, otherwise home */}
          <Route
            path="*"
            element={
              account ? <Navigate to="/dashboard" replace /> : isConnecting ? <LoadingSpinner /> : <Navigate to="/" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;