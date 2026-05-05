import CrowdfundingJSON from "../contracts/Crowdfunding.json";

export const CONTRACT_ADDRESS = "0x64c3E2b3C64743e682eB073Fb95F54d92a6BfC45";
export const SEPOLIA_CHAIN_ID = 11155111;

// Handle both direct array and wrapped ABI formats
export const CONTRACT_ABI = Array.isArray(CrowdfundingJSON) 
  ? CrowdfundingJSON 
  : CrowdfundingJSON.abi || CrowdfundingJSON;

// Validate ABI has required functions
const validateABI = () => {
  const requiredFunctions = ['getCampaignCount', 'campaignCount', 'campaigns', 'createCampaign', 'contribute', 'getContribution'];
  const abiNames = CONTRACT_ABI.map(item => item.name).filter(Boolean);
  const missing = requiredFunctions.filter(fn => !abiNames.includes(fn));
  if (missing.length > 0) {
    console.warn(`⚠️ ABI missing functions: ${missing.join(', ')}`);
  }
};

validateABI();