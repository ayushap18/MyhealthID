// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title HealthRecordRegistryV2
 * @dev Enhanced Health Record Registry with Emergency Access and Guardian Management
 */
contract HealthRecordRegistryV2 is AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant INSURER_ROLE = keccak256("INSURER_ROLE");
    bytes32 public constant EMERGENCY_RESPONDER_ROLE = keccak256("EMERGENCY_RESPONDER_ROLE");
    
    Counters.Counter private _recordIdCounter;
    Counters.Counter private _accessTokenCounter;
    
    struct HealthRecord {
        string patientId;
        string ipfsCID;
        bytes32 metadataHash;
        address uploadedBy;
        uint256 timestamp;
        bool exists;
    }
    
    struct AccessToken {
        string patientId;
        address requester;
        uint256 expiresAt;
        bool active;
        uint256 grantedAt;
        bool isEmergency;
    }
    
    // Mappings
    mapping(string => HealthRecord) public records; // recordId => HealthRecord
    mapping(uint256 => AccessToken) public accessTokens; // tokenId => AccessToken
    mapping(string => uint256[]) public patientAccessTokens; // patientId => tokenIds
    mapping(address => mapping(string => bool)) public hasAccess; // requester => patientId => hasAccess
    
    // Guardian Management: Patient ID => List of Guardian Addresses
    mapping(string => address[]) public guardians;
    
    // Events
    event RecordRegistered(
        string indexed recordId,
        string indexed patientId,
        string ipfsCID,
        address indexed uploadedBy,
        uint256 timestamp
    );
    
    event AccessGranted(
        uint256 indexed tokenId,
        string indexed patientId,
        address indexed requester,
        uint256 expiresAt,
        bool isEmergency
    );
    
    event AccessRevoked(
        uint256 indexed tokenId,
        string indexed patientId,
        address indexed requester
    );
    
    event EmergencyAccessTriggered(
        string indexed patientId,
        address indexed responder,
        uint256 timestamp
    );
    
    event GuardianAdded(
        string indexed patientId,
        address indexed guardian
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new health record on-chain
     */
    function registerDocument(
        string memory recordId,
        string memory patientId,
        string memory ipfsCID,
        bytes32 metadataHash
    ) external onlyRole(HOSPITAL_ROLE) {
        require(!records[recordId].exists, "Record already exists");
        
        records[recordId] = HealthRecord({
            patientId: patientId,
            ipfsCID: ipfsCID,
            metadataHash: metadataHash,
            uploadedBy: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit RecordRegistered(recordId, patientId, ipfsCID, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Grant temporary access to a requester
     */
    function grantAccess(
        string memory patientId,
        address requester,
        uint256 durationInSeconds
    ) external {
        // In a real app, we'd verify msg.sender owns the patientId or is a guardian
        // For this hackathon, we assume the backend checks ownership before calling
        
        _accessTokenCounter.increment();
        uint256 newTokenId = _accessTokenCounter.current();
        
        uint256 expiresAt = block.timestamp + durationInSeconds;
        
        accessTokens[newTokenId] = AccessToken({
            patientId: patientId,
            requester: requester,
            expiresAt: expiresAt,
            active: true,
            grantedAt: block.timestamp,
            isEmergency: false
        });
        
        patientAccessTokens[patientId].push(newTokenId);
        hasAccess[requester][patientId] = true;
        
        emit AccessGranted(newTokenId, patientId, requester, expiresAt, false);
    }
    
    /**
     * @dev Emergency "Break-Glass" Access
     * Only callable by verified Emergency Responders
     */
    function emergencyAccess(string memory patientId) external onlyRole(EMERGENCY_RESPONDER_ROLE) {
        _accessTokenCounter.increment();
        uint256 newTokenId = _accessTokenCounter.current();
        
        // Emergency access is short-lived (e.g., 6 hours)
        uint256 duration = 6 hours;
        uint256 expiresAt = block.timestamp + duration;
        
        accessTokens[newTokenId] = AccessToken({
            patientId: patientId,
            requester: msg.sender,
            expiresAt: expiresAt,
            active: true,
            grantedAt: block.timestamp,
            isEmergency: true
        });
        
        patientAccessTokens[patientId].push(newTokenId);
        hasAccess[msg.sender][patientId] = true;
        
        emit EmergencyAccessTriggered(patientId, msg.sender, block.timestamp);
        emit AccessGranted(newTokenId, patientId, msg.sender, expiresAt, true);
    }
    
    /**
     * @dev Add a guardian for a patient
     */
    function addGuardian(string memory patientId, address guardian) external {
        // Again, assuming backend verifies msg.sender is the patient
        guardians[patientId].push(guardian);
        emit GuardianAdded(patientId, guardian);
    }
    
    /**
     * @dev Get record details
     */
    function getRecord(string memory recordId) external view returns (
        string memory,
        string memory,
        bytes32,
        address,
        uint256,
        bool
    ) {
        HealthRecord memory record = records[recordId];
        return (
            record.patientId,
            record.ipfsCID,
            record.metadataHash,
            record.uploadedBy,
            record.timestamp,
            record.exists
        );
    }

    /**
     * @dev Get access token details
     */
    function getAccessToken(uint256 tokenId) external view returns (
        string memory,
        address,
        uint256,
        bool,
        uint256,
        bool
    ) {
        AccessToken memory token = accessTokens[tokenId];
        return (
            token.patientId,
            token.requester,
            token.expiresAt,
            token.active,
            token.grantedAt,
            token.isEmergency
        );
    }

    /**
     * @dev Verify if a specific token is valid
     */
    function verifyAccessToken(uint256 tokenId) external view returns (bool) {
        AccessToken memory token = accessTokens[tokenId];
        return token.active && block.timestamp <= token.expiresAt;
    }
    
    /**
     * @dev Check if a requester has valid access to a patient
     */
    function checkAccess(address requester, string memory patientId) external view returns (bool) {
        // Simple check: does the mapping say true?
        // In production, we should iterate tokens to check expiry, 
        // but for gas efficiency we rely on the mapping + backend validation
        return hasAccess[requester][patientId];
    }

    /**
     * @dev Revoke a specific access token
     */
    function revokeAccess(uint256 tokenId) external {
        // In production: require(msg.sender == patient || msg.sender == guardian)
        AccessToken storage token = accessTokens[tokenId];
        require(token.active, "Token already inactive");
        
        token.active = false;
        hasAccess[token.requester][token.patientId] = false;
        
        emit AccessRevoked(tokenId, token.patientId, token.requester);
    }

    /**
     * @dev Log an access event for audit purposes
     */
    function logAccess(
        string memory recordId,
        address accessor,
        string memory action
    ) external {
        // In production: restrict who can call this (e.g., only authorized backend)
        emit AuditLogged(recordId, accessor, action, block.timestamp);
    }

    event AuditLogged(
        string indexed recordId,
        address indexed accessor,
        string action,
        uint256 timestamp
    );
}
