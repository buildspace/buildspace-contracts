// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Buildspace is ERC721URIStorage {
    mapping(address => mapping(string => bool)) public claimed;
    mapping(string => uint256) public cohortLimits;
    mapping(string => uint256) public cohortTokensMinted;
    mapping(string => bytes32) private merkleRoot;
    mapping(address => bool) private admins;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;

    address owner;
    string contractBaseURI;
    bool allowsTransfers = false;

    event Claim(
        address indexed _receiver,
        string indexed _cohortId,
        uint256 _cohortIndex,
        uint256 _contractIndex,
        bool _isAdmin
    );

    constructor(string memory _contractBaseURI)
        ERC721("buildspace", "BUILDSPACE")
    {
        owner = msg.sender;
        admins[msg.sender] = true;
        contractBaseURI = _contractBaseURI;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] == true);
        _;
    }

    modifier limitCheck(string memory _cohortId, address to) {
        require(
            cohortTokensMinted[_cohortId] < cohortLimits[_cohortId],
            "Buildspace: max tokens issued for cohort"
        );
        require(
            !claimed[to][_cohortId],
            "Buildspace: address has already claimed token."
        );
        _;
    }

    modifier user(string memory _cohortId, address to) {
        require(
            cohortTokensMinted[_cohortId] < cohortLimits[_cohortId],
            "Buildspace: max tokens issued for cohort"
        );
        require(
            !claimed[to][_cohortId],
            "Buildspace: address has already claimed token."
        );
        _;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return contractBaseURI;
    }

    function issueToken(
        string memory _cohortId,
        address to,
        bool _isAdmin
    ) internal returns (uint256) {
        uint256 nextCohortTokenIndex = cohortTokensMinted[_cohortId];
        string memory _uri = string(
            abi.encodePacked(
                _cohortId,
                "-",
                uint2str(nextCohortTokenIndex),
                "/metadata.json"
            )
        );

        uint256 newTokenId = _tokenIdTracker.current();
        _safeMint(to, newTokenId);
        claimed[to][_cohortId] = true;
        emit Claim(to, _cohortId, nextCohortTokenIndex, newTokenId, _isAdmin);

        _setTokenURI(newTokenId, _uri);

        cohortTokensMinted[_cohortId] = nextCohortTokenIndex + 1;
        _tokenIdTracker.increment();

        return newTokenId;
    }

    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) return "0";

        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }

        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + (j % 10)));
            j /= 10;
        }
        str = string(bstr);
        return str;
    }

    function adminClaimToken(string memory _cohortId, address to)
        external
        onlyAdmin
        limitCheck(_cohortId, to)
        returns (uint256)
    {
        return issueToken(_cohortId, to, true);
    }

    function claimToken(string memory _cohortId, bytes32[] memory _proof)
        external
        limitCheck(_cohortId, msg.sender)
        returns (uint256)
    {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(_proof, merkleRoot[_cohortId], leaf),
            "Buildspace: address not eligible for claim"
        );

        return issueToken(_cohortId, msg.sender, false);
    }

    function setAllowsTransfers(bool _allowsTransfers) external onlyAdmin {
        allowsTransfers = _allowsTransfers;
    }

    function createCohort(string memory _cohortId, uint256 _limit)
        external
        onlyAdmin
    {
        cohortLimits[_cohortId] = _limit;
        cohortTokensMinted[_cohortId] = 0;
    }

    function setMerkleRoot(string memory _cohortId, bytes32 _merkleRoot)
        external
        onlyAdmin
    {
        require(cohortLimits[_cohortId] > 0, "No cohort limit set");
        merkleRoot[_cohortId] = _merkleRoot;
    }

    function limitForCohort(string memory _cohortId)
        public
        view
        returns (uint256)
    {
        return cohortLimits[_cohortId];
    }

    function tokensClaimedForCohort(string memory _cohortId)
        public
        view
        returns (uint256)
    {
        return cohortTokensMinted[_cohortId];
    }

    function updateAdmin(address _admin, bool isAdmin) external {
        require(msg.sender == owner, "Only contract owner can update admins");
        admins[_admin] = isAdmin;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        require(
            _exists(tokenId) == false || allowsTransfers == true,
            "Not allowed to transfer"
        );
        return super._beforeTokenTransfer(from, to, tokenId);
    }
}
