// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title HealthRecordRegistry
 * @dev Manages health record registration, access control, and audit logs on Polygon
 */
contract HealthRecordRegistry is AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant INSURER_ROLE = keccak256("INSURER_ROLE");
    
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
    }
    
    struct AuditEntry {
        string recordId;
        address accessor;
        string action;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(string => HealthRecord) public records; // recordId => HealthRecord
    mapping(uint256 => AccessToken) public accessTokens; // tokenId => AccessToken
    mapping(string => uint256[]) public patientAccessTokens; // patientId => tokenIds
    mapping(address => mapping(string => bool)) public hasAccess; // requester => patientId => hasAccess
    
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
        uint256 expiresAt
    );
    
    event AccessRevoked(
        uint256 indexed tokenId,
        string indexed patientId,
        address indexed requester
    );
    
    event AuditLogged(
        string indexed recordId,
        address indexed accessor,
        string action,
        uint256 timestamp
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
     * @dev Grant access to a requester for a patient's records
     */
    function grantAccess(
        string memory patientId,
        address requester,
        uint256 expiresAt
    ) external returns (uint256) {
        require(expiresAt > block.timestamp, "Invalid expiration time");
        
        uint256 tokenId = _accessTokenCounter.current();
        _accessTokenCounter.increment();
        
        accessTokens[tokenId] = AccessToken({
            patientId: patientId,
            requester: requester,
            expiresAt: expiresAt,
            active: true,
            grantedAt: block.timestamp
        });
        
        patientAccessTokens[patientId].push(tokenId);
        hasAccess[requester][patientId] = true;
        
        emit AccessGranted(tokenId, patientId, requester, expiresAt);
        
        return tokenId;
    }
    
    /**
     * @dev Revoke access token
     */
    function revokeAccess(uint256 tokenId) external {
        AccessToken storage token = accessTokens[tokenId];
        require(token.active, "Token already inactive");
        
        token.active = false;
        hasAccess[token.requester][token.patientId] = false;
        
        emit AccessRevoked(tokenId, token.patientId, token.requester);
    }
    
    /**
     * @dev Log an access event on-chain
     */
    function logAccess(
        string memory recordId,
        address accessor,
        string memory action
    ) external {
        require(records[recordId].exists, "Record does not exist");
        
        emit AuditLogged(recordId, accessor, action, block.timestamp);
    }
    
    /**
     * @dev Check if an address has access to a patient's records
     */
    function checkAccess(address requester, string memory patientId) 
        external 
        view 
        returns (bool) 
    {
        return hasAccess[requester][patientId];
    }
    
    /**
     * @dev Get record details
     */
    function getRecord(string memory recordId) 
        external 
        view 
        returns (
            string memory patientId,
            string memory ipfsCID,
            bytes32 metadataHash,
            address uploadedBy,
            uint256 timestamp
        ) 
    {
        HealthRecord memory record = records[recordId];
        require(record.exists, "Record does not exist");
        
        return (
            record.patientId,
            record.ipfsCID,
            record.metadataHash,
            record.uploadedBy,
            record.timestamp
        );
    }
    
    /**
     * @dev Get access token details
     */
    function getAccessToken(uint256 tokenId)
        external
        view
        returns (
            string memory patientId,
            address requester,
            uint256 expiresAt,
            bool active,
            uint256 grantedAt
        )
    {
        AccessToken memory token = accessTokens[tokenId];
        return (
            token.patientId,
            token.requester,
            token.expiresAt,
            token.active,
            token.grantedAt
        );
    }
    
    /**
     * @dev Grant hospital role to an address
     */
    function addHospital(address hospital) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(HOSPITAL_ROLE, hospital);
    }
    
    /**
     * @dev Grant insurer role to an address
     */
    function addInsurer(address insurer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(INSURER_ROLE, insurer);
    }
}
