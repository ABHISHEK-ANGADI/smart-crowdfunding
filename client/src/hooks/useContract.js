import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_CHAIN_ID } from "../utils/constants";
import toast from "react-hot-toast";

export const useContract = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [readContract, setReadContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [balance, setBalance] = useState(null); // NEW

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    } else {
      toast.error("MetaMask not installed");
    }
  }, []);

  // Listen for account or network changes
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setAccount(null);
        setSigner(null);
        setContract(null);
        setReadContract(null);
        setNetworkError(null);
        setBalance(null);
        localStorage.removeItem("walletConnected");
      } else {
        // Force reconnect to update account and balance
        connectWallet();
      }
    };
    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []); // eslint-disable-line

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!provider || !account) return;
    try {
      const bal = await provider.getBalance(account);
      const formatted = parseFloat(ethers.formatEther(bal)).toFixed(4);
      setBalance(formatted);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setBalance(null);
    }
  }, [provider, account]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!provider) {
      toast.error("Please install MetaMask");
      return;
    }
    setIsConnecting(true);
    setNetworkError(null);
    try {
      const network = await provider.getNetwork();
      console.log(`📡 Current network: ${network.name} (chainId: ${network.chainId})`);
      
      const currentChainId = BigInt(network.chainId);
      const expectedChainId = BigInt(SEPOLIA_CHAIN_ID);
      
      if (currentChainId !== expectedChainId) {
        const msg = `❌ Wrong network! Please switch to Sepolia (chainId 11155111). Currently on ${network.name} (${network.chainId})`;
        console.error(msg);
        setNetworkError(msg);
        toast.error(msg);
        setIsConnecting(false);
        return;
      }
      
      setNetworkError(null);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signerInstance = await provider.getSigner();
      setSigner(signerInstance);
      setAccount(accounts[0]);

      const writeContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signerInstance
      );
      
      const readOnlyContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      
      setContract(writeContract);
      setReadContract(readOnlyContract);
      
      console.log(`✅ Connected: ${accounts[0]} on Sepolia`);
      console.log(`📄 Contract address: ${CONTRACT_ADDRESS}`);
      
      toast.success("Wallet connected to Sepolia!");
      localStorage.setItem("walletConnected", "true");
      
      // Fetch balance after connection
      await fetchBalance();
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [provider, fetchBalance]);

  // Auto-connect
  useEffect(() => {
    if (provider && localStorage.getItem("walletConnected") === "true") {
      connectWallet();
    }
  }, [provider, connectWallet]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setReadContract(null);
    setNetworkError(null);
    setBalance(null);
    localStorage.removeItem("walletConnected");
    toast.success("Wallet disconnected");
  }, []);

  // Fetch campaigns (unchanged from your current version, just kept for context)
  const fetchCampaigns = useCallback(async () => {
    const contractToUse = readContract || contract;
    if (!contractToUse) {
      console.warn("⚠️  fetchCampaigns: No contract instance available");
      return;
    }
    setLoading(true);
    try {
      // ... (your existing fetch logic, no changes needed)
      console.log("🔄 Fetching campaign count...");
      console.log(`   Contract: ${CONTRACT_ADDRESS}`);
      
      let count;
      try {
        console.log("   Trying getCampaignCount()...");
        count = await contractToUse.getCampaignCount();
        console.log(`✅ Got count via getCampaignCount(): ${count.toString()}`);
      } catch (getCampaignCountError) {
        console.warn(`⚠️  getCampaignCount() failed:`, getCampaignCountError.message);
        try {
          console.log("   Trying campaignCount()...");
          count = await contractToUse.campaignCount();
          console.log(`✅ Got count via campaignCount(): ${count.toString()}`);
        } catch (campaignCountError) {
          console.error(`❌ Both methods failed:`);
          console.error(`   getCampaignCount: ${getCampaignCountError.message}`);
          console.error(`   campaignCount: ${campaignCountError.message}`);
          throw new Error(
            `Could not fetch campaign count. getCampaignCount: ${getCampaignCountError.message}. ` +
            `campaignCount: ${campaignCountError.message}`
          );
        }
      }
      
      const countNum = Number(count);
      console.log(`📊 Total campaigns: ${countNum}`);
      
      const campaignsArray = [];
      for (let i = 0; i < countNum; i++) {
        try {
          const campaign = await contractToUse.campaigns(i);
          campaignsArray.push({
            id: i,
            creator: campaign.creator,
            title: campaign.title,
            goal: campaign.goal.toString(),
            deadline: Number(campaign.deadline),
            totalRaised: campaign.totalRaised.toString(),
            claimed: campaign.claimed,
          });
          console.log(`   ✓ Campaign ${i} loaded`);
        } catch (campaignError) {
          console.error(`❌ Failed to load campaign ${i}:`, campaignError.message);
        }
      }
      
      setCampaigns(campaignsArray);
      console.log(`✅ Loaded ${campaignsArray.length} campaigns successfully`);
    } catch (error) {
      console.error("❌ Fetch campaigns error:", error);
      if (error.message?.includes("chainId") || networkError) {
        toast.error("Network error: Please ensure you're on Sepolia testnet");
      } else if (error.message?.includes("Could not decode")) {
        toast.error("Contract data error: ABI may not match deployed contract");
      } else {
        toast.error("Failed to fetch campaigns: " + (error.message || error.toString()));
      }
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [contract, readContract, networkError]);

  // Fetch on contract ready
  useEffect(() => {
    if (contract || readContract) {
      console.log("📋 Contract instance ready, fetching campaigns...");
      fetchCampaigns();
    }
  }, [contract, readContract, fetchCampaigns]);

  // Transaction wrappers (each now calls fetchBalance after success)
  const createCampaign = async (title, goalETH, durationDays) => {
    if (!contract) throw new Error("Contract not initialized");
    const goalWei = ethers.parseEther(goalETH);
    const durationSeconds = Math.floor(durationDays * 24 * 60 * 60);
    console.log(`📝 Creating campaign: "${title}"`);
    const tx = await contract.createCampaign(title, goalWei, durationSeconds);
    await toast.promise(tx.wait(), {
      loading: "Creating campaign...",
      success: "Campaign created!",
      error: "Failed to create campaign",
    });
    console.log("✅ Campaign created, refreshing list...");
    setTimeout(() => {
      fetchCampaigns();
      fetchBalance(); // ← update balance
    }, 1000);
    return tx;
  };

  const contribute = async (campaignId, amountETH) => {
    if (!contract) throw new Error("Contract not initialized");
    const amountWei = ethers.parseEther(amountETH);
    console.log(`💰 Contributing ${amountETH} ETH to campaign ${campaignId}`);
    const tx = await contract.contribute(campaignId, { value: amountWei });
    await toast.promise(tx.wait(), {
      loading: "Processing contribution...",
      success: "Contribution successful!",
      error: "Failed to contribute",
    });
    console.log("✅ Contribution processed, refreshing campaigns...");
    setTimeout(() => {
      fetchCampaigns();
      fetchBalance(); // ← update balance
    }, 1000);
    return tx;
  };

  const claimFunds = async (campaignId) => {
    if (!contract) throw new Error("Contract not initialized");
    console.log(`🎯 Claiming funds from campaign ${campaignId}`);
    const tx = await contract.claimFunds(campaignId);
    await toast.promise(tx.wait(), {
      loading: "Claiming funds...",
      success: "Funds claimed!",
      error: "Failed to claim",
    });
    console.log("✅ Funds claimed, refreshing campaigns...");
    setTimeout(() => {
      fetchCampaigns();
      fetchBalance(); // ← update balance
    }, 1000);
    return tx;
  };

  const refund = async (campaignId) => {
    if (!contract) throw new Error("Contract not initialized");
    const tx = await contract.refund(campaignId);
    await toast.promise(tx.wait(), {
      loading: "Processing refund...",
      success: "Refund successful!",
      error: "Failed to refund",
    });
    setTimeout(() => {
      fetchCampaigns();
      fetchBalance(); // ← update balance
    }, 1000);
    return tx;
  };

  const getUserContribution = async (campaignId, userAddress) => {
    if (!contract) return 0n;
    return await contract.getContribution(campaignId, userAddress);
  };

  // Event listeners (unchanged)
  useEffect(() => {
    if (!contract) return;
    const handleCampaignCreated = () => fetchCampaigns();
    const handleContribution = () => fetchCampaigns();
    contract.on("CampaignCreated", handleCampaignCreated);
    contract.on("ContributionMade", handleContribution);
    contract.on("FundsClaimed", handleCampaignCreated);
    contract.on("RefundIssued", handleCampaignCreated);
    return () => {
      contract.off("CampaignCreated", handleCampaignCreated);
      contract.off("ContributionMade", handleContribution);
      contract.off("FundsClaimed", handleCampaignCreated);
      contract.off("RefundIssued", handleCampaignCreated);
    };
  }, [contract, fetchCampaigns]);

  return {
    provider,
    account,
    isConnecting,
    connectWallet,
    disconnectWallet,
    contract,
    readContract,
    campaigns,
    loading,
    networkError,
    balance,           // NEW
    fetchBalance,      // NEW (optional, for manual refresh)
    fetchCampaigns,
    createCampaign,
    contribute,
    claimFunds,
    refund,
    getUserContribution,
  };
};