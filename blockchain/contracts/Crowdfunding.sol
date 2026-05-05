// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Smart Crowdfunding
 * @dev A decentralized crowdfunding platform with automatic refunds and transparent fund tracking.
 */
contract Crowdfunding {
    
    // ============ STRUCTS ============
    
    /// @dev Represents a single crowdfunding campaign.
    struct Campaign {
        address creator;           // Wallet address of the campaign creator
        string title;              // Campaign title (stored on-chain for simplicity)
        uint256 goal;              // Target amount in Wei
        uint256 deadline;          // Unix timestamp when campaign ends
        uint256 totalRaised;       // Total ETH raised so far
        bool claimed;              // Whether funds have been claimed by creator
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Total number of campaigns created (also serves as next campaign ID).
    uint256 public campaignCount;
    
    /// @dev Maps campaign ID to Campaign struct.
    mapping(uint256 => Campaign) public campaigns;
    
    /// @dev Maps campaign ID => contributor address => amount contributed (in Wei).
    mapping(uint256 => mapping(address => uint256)) public contributions;
    
    // ============ EVENTS ============
    
    /// @dev Emitted when a new campaign is created.
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 goal,
        uint256 deadline
    );
    
    /// @dev Emitted when a contribution is made.
    event ContributionMade(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );
    
    /// @dev Emitted when campaign funds are claimed by the creator.
    event FundsClaimed(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount
    );
    
    /// @dev Emitted when a contributor receives a refund.
    event RefundIssued(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );
    
    // ============ MODIFIERS ============
    
    /// @dev Ensures a campaign exists.
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId < campaignCount, "Campaign does not exist");
        _;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Creates a new crowdfunding campaign.
     * @param _title Title of the campaign.
     * @param _goal Target amount in Wei.
     * @param _durationInSeconds Duration of campaign from current block timestamp.
     */
    function createCampaign(
        string memory _title,
        uint256 _goal,
        uint256 _durationInSeconds
    ) external {
        require(_goal > 0, "Goal must be greater than zero");
        require(_durationInSeconds > 0, "Duration must be greater than zero");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        uint256 deadline = block.timestamp + _durationInSeconds;
        
        campaigns[campaignCount] = Campaign({
            creator: msg.sender,
            title: _title,
            goal: _goal,
            deadline: deadline,
            totalRaised: 0,
            claimed: false
        });
        
        emit CampaignCreated(
            campaignCount,
            msg.sender,
            _title,
            _goal,
            deadline
        );
        
        campaignCount++;
    }
    
    /**
     * @dev Allows a user to contribute ETH to a campaign.
     * @param _campaignId ID of the campaign to contribute to.
     */
    function contribute(uint256 _campaignId)
        external
        payable
        campaignExists(_campaignId)
    {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(block.timestamp < campaign.deadline, "Campaign deadline has passed");
        require(msg.value > 0, "Contribution must be greater than zero");
        require(!campaign.claimed, "Campaign already claimed");
        require(campaign.totalRaised < campaign.goal, "Campaign goal already reached");
        
        // Update total raised
        campaign.totalRaised += msg.value;
        
        // Record individual contribution
        contributions[_campaignId][msg.sender] += msg.value;
        
        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }
    
    /**
     * @dev Allows the campaign creator to claim funds if goal is met and deadline passed.
     * @param _campaignId ID of the campaign.
     */
    function claimFunds(uint256 _campaignId)
        external
        campaignExists(_campaignId)
    {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(msg.sender == campaign.creator, "Only creator can claim funds");
        require(block.timestamp >= campaign.deadline, "Campaign deadline not yet reached");
        require(campaign.totalRaised >= campaign.goal, "Goal not reached");
        require(!campaign.claimed, "Funds already claimed");
        
        campaign.claimed = true;
        
        uint256 amount = campaign.totalRaised;
        
        // Transfer funds to creator
        (bool sent, ) = payable(campaign.creator).call{value: amount}("");
        require(sent, "Failed to send funds");
        
        emit FundsClaimed(_campaignId, campaign.creator, amount);
    }
    
    /**
     * @dev Allows a contributor to claim a refund if campaign failed (deadline passed, goal not met).
     * @param _campaignId ID of the campaign.
     */
    function refund(uint256 _campaignId)
        external
        campaignExists(_campaignId)
    {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(block.timestamp >= campaign.deadline, "Campaign deadline not yet reached");
        require(campaign.totalRaised < campaign.goal, "Campaign succeeded, no refunds available");
        
        uint256 contributedAmount = contributions[_campaignId][msg.sender];
        require(contributedAmount > 0, "No contribution found for this campaign");
        
        // Reset contribution to prevent re-entrancy
        contributions[_campaignId][msg.sender] = 0;
        
        // Send ETH back to contributor
        (bool sent, ) = payable(msg.sender).call{value: contributedAmount}("");
        require(sent, "Failed to send refund");
        
        emit RefundIssued(_campaignId, msg.sender, contributedAmount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Returns the total number of campaigns created.
     */
    function getCampaignCount() external view returns (uint256) {
        return campaignCount;
    }
    
    /**
     * @dev Returns the contribution amount of a specific address to a specific campaign.
     * @param _campaignId ID of the campaign.
     * @param _contributor Address of the contributor.
     */
    function getContribution(uint256 _campaignId, address _contributor)
        external
        view
        returns (uint256)
    {
        return contributions[_campaignId][_contributor];
    }
    
    /**
     * @dev Checks if a campaign is active (within deadline and goal not yet met).
     * @param _campaignId ID of the campaign.
     */
    function isCampaignActive(uint256 _campaignId)
        external
        view
        campaignExists(_campaignId)
        returns (bool)
    {
        Campaign storage campaign = campaigns[_campaignId];
        return (block.timestamp < campaign.deadline &&
                campaign.totalRaised < campaign.goal &&
                !campaign.claimed);
    }
}