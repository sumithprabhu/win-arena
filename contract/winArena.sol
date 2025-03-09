// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract WinArena is Ownable {
    IERC20 public stablecoin;
    uint256 public winConversionRate = 10;
    uint256 public gameDuration = 1 days;

    struct User {
        string username;
        uint256 winBalance;
        bool registered;
    }

    struct Game {
        string name;
        string description;
        uint256 winEntryFee;
        uint256 leaderboardType;
        uint256 startTime;
        uint256 lockedWinPool;
        bool active;
    }

    struct ScoreEntry {
        address player;
        string username;
        uint256 score;
    }

    mapping(address => User) public users;
    mapping(uint256 => Game) public games;
    mapping(uint256 => ScoreEntry[]) public leaderboards;
    mapping(uint256 => mapping(address => uint256)) public userScores;
    mapping(uint256 => uint256[]) public leaderboardTypes;
    mapping(uint256 => mapping(address => bool)) public gameParticipants;
    mapping(uint256 => ScoreEntry[][]) public gameHistory;
    mapping(uint256 => uint256[]) public gameStartTimestamps;

    uint256 public totalGames = 0;
    uint256 public totalUsers = 0;
    uint256 public totalLeaderboardTypes = 0;

    event UserRegistered(address indexed user, string username);
    event StablecoinDeposited(
        address indexed user,
        uint256 amount,
        uint256 winPoints
    );
    event GameCreated(uint256 gameId, string name, uint256 winEntryFee);
    event GameStarted(uint256 gameId);
    event LeaderboardTypeAdded(uint256 typeId, uint256[] percentages);
    event GameEntered(
        address indexed user,
        uint256 gameId,
        uint256 winEntryFee
    );
    event ScoreUpdated(address indexed user, uint256 gameId, uint256 score);
    event GameSettled(
        uint256 gameId,
        address first,
        address second,
        address third
    );
    event StablecoinWithdrawn(address indexed user, uint256 amount);

    constructor(address _stablecoin) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
    }

    function registerUser(string memory _username) external {
        require(!users[msg.sender].registered, "User already registered");

        totalUsers++;
        string memory uniqueUsername = string(
            abi.encodePacked(_username, "#", formatNumber(totalUsers))
        );

        users[msg.sender] = User(uniqueUsername, 0, true);
        emit UserRegistered(msg.sender, uniqueUsername);
    }

    function depositStablecoin(uint256 _amount) external {
        require(
            stablecoin.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        uint256 winPoints = _amount * winConversionRate;
        users[msg.sender].winBalance += winPoints;

        emit StablecoinDeposited(msg.sender, _amount, winPoints);
    }

    function withdrawStablecoin(uint256 _winAmount) external {
        require(
            users[msg.sender].winBalance >= _winAmount,
            "Insufficient WIN balance"
        );

        uint256 stablecoinAmount = _winAmount / winConversionRate;
        require(
            stablecoin.balanceOf(address(this)) >= stablecoinAmount,
            "Not enough stablecoins in contract"
        );

        users[msg.sender].winBalance -= _winAmount;
        stablecoin.transfer(msg.sender, stablecoinAmount);

        emit StablecoinWithdrawn(msg.sender, stablecoinAmount);
    }

    function addLeaderboardType(uint256[] memory _percentages)
        external
        onlyOwner
    {
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _percentages.length; i++) {
            totalPercentage += _percentages[i];
        }
        require(totalPercentage == 100, "Total must sum to 100");

        leaderboardTypes[totalLeaderboardTypes] = _percentages;
        emit LeaderboardTypeAdded(totalLeaderboardTypes, _percentages);
        totalLeaderboardTypes++;
    }

    function createGame(
        string memory _name,
        string memory _description,
        uint256 _winEntryFee,
        uint256 _leaderboardType
    ) external onlyOwner {
        require(
            _leaderboardType < totalLeaderboardTypes,
            "Invalid leaderboard type"
        );

        games[totalGames] = Game(
            _name,
            _description,
            _winEntryFee,
            _leaderboardType,
            block.timestamp,
            0,
            false
        );
        totalGames++;

        emit GameCreated(totalGames - 1, _name, _winEntryFee);
    }

    function startGame(uint256 _gameId) external onlyOwner {
        require(!games[_gameId].active, "Game already started");

        if (leaderboards[_gameId].length > 0) {
            gameHistory[_gameId].push(leaderboards[_gameId]);
            gameStartTimestamps[_gameId].push(games[_gameId].startTime);
        }

        delete leaderboards[_gameId];

        games[_gameId].active = true;
        games[_gameId].startTime = block.timestamp;
        games[_gameId].lockedWinPool = 0;

        emit GameStarted(_gameId);
    }

    function enterGame(uint256 _gameId) external {
        require(users[msg.sender].registered, "User not registered");
        require(games[_gameId].active, "Game not active");
        require(
            users[msg.sender].winBalance >= games[_gameId].winEntryFee,
            "Insufficient WIN points"
        );
        require(!gameParticipants[_gameId][msg.sender], "Already entered");

        users[msg.sender].winBalance -= games[_gameId].winEntryFee;
        games[_gameId].lockedWinPool += games[_gameId].winEntryFee;
        gameParticipants[_gameId][msg.sender] = true;

        emit GameEntered(msg.sender, _gameId, games[_gameId].winEntryFee);
    }

    function updateScore(uint256 _gameId, uint256 _score) external {
        require(
            gameParticipants[_gameId][msg.sender],
            "User not entered in game"
        );

        // Only update if the new score is higher
        if (_score > userScores[_gameId][msg.sender]) {
            userScores[_gameId][msg.sender] = _score;

            ScoreEntry[] storage scores = leaderboards[_gameId];
            bool found = false;

            // Check if user already exists in the leaderboard
            for (uint256 i = 0; i < scores.length; i++) {
                if (scores[i].player == msg.sender) {
                    scores[i].score = _score;
                    found = true;
                    break;
                }
            }

            // If not found, add the user
            if (!found) {
                scores.push(
                    ScoreEntry(msg.sender, users[msg.sender].username, _score)
                );
            }

            // Sort leaderboard (Descending order - highest score first)
            for (uint256 i = 0; i < scores.length; i++) {
                for (uint256 j = i + 1; j < scores.length; j++) {
                    if (scores[j].score > scores[i].score) {
                        ScoreEntry memory temp = scores[i];
                        scores[i] = scores[j];
                        scores[j] = temp;
                    }
                }
            }
        }

        emit ScoreUpdated(msg.sender, _gameId, _score);
    }

    function settleGame(uint256 _gameId) external onlyOwner {
        require(games[_gameId].active, "Game already settled");
        require(
            block.timestamp >= games[_gameId].startTime + gameDuration,
            "Game still ongoing"
        );

        ScoreEntry[] storage scores = leaderboards[_gameId];
        uint256 totalWinPool = games[_gameId].lockedWinPool;
        uint256[] memory rewards = leaderboardTypes[
            games[_gameId].leaderboardType
        ];

        // Distribute rewards to top players based on leaderboard type
        for (uint256 i = 0; i < rewards.length; i++) {
            if (i < scores.length) {
                users[scores[i].player].winBalance +=
                    (totalWinPool * rewards[i]) /
                    100;
            }
        }

        games[_gameId].active = false;
        emit GameSettled(
            _gameId,
            scores.length > 0 ? scores[0].player : address(0),
            scores.length > 1 ? scores[1].player : address(0),
            scores.length > 2 ? scores[2].player : address(0)
        );
    }

    function viewGameHistory(uint256 _gameId)
        external
        view
        returns (ScoreEntry[][] memory, uint256[] memory)
    {
        return (gameHistory[_gameId], gameStartTimestamps[_gameId]);
    }

    function viewLeaderboard(uint256 _gameId)
        external
        view
        returns (ScoreEntry[] memory)
    {
        return leaderboards[_gameId];
    }

    function viewGameLeaderboardHistory(uint256 _gameId)
        external
        view
        returns (ScoreEntry[][] memory, uint256[] memory)
    {
        return (gameHistory[_gameId], gameStartTimestamps[_gameId]);
    }

    function viewLeaderboardTypes() external view returns (uint256[][] memory) {
        uint256[][] memory allTypes = new uint256[][](totalLeaderboardTypes);
        for (uint256 i = 0; i < totalLeaderboardTypes; i++) {
            allTypes[i] = leaderboardTypes[i];
        }
        return allTypes;
    }

    function viewGameDetails(uint256 _gameId)
        external
        view
        returns (
            string memory name,
            string memory description,
            uint256 winEntryFee,
            uint256 leaderboardType,
            uint256 startTime,
            uint256 lockedWinPool,
            bool active
        )
    {
        Game storage game = games[_gameId];
        return (
            game.name,
            game.description,
            game.winEntryFee,
            game.leaderboardType,
            game.startTime,
            game.lockedWinPool,
            game.active
        );
    }

    function viewUserScore(uint256 _gameId, address _user)
        external
        view
        returns (uint256)
    {
        return userScores[_gameId][_user];
    }

    function viewUserGameStatus(uint256 _gameId, address _user)
        external
        view
        returns (bool)
    {
        return gameParticipants[_gameId][_user];
    }

    function viewLockedPool(uint256 _gameId) external view returns (uint256) {
        return games[_gameId].lockedWinPool;
    }

    function getActiveGames() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < totalGames; i++) {
            if (games[i].active) {
                activeCount++;
            }
        }

        uint256[] memory activeGames = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < totalGames; i++) {
            if (games[i].active) {
                activeGames[index] = i;
                index++;
            }
        }

        return activeGames;
    }

    function formatNumber(uint256 _num) internal pure returns (string memory) {
        string memory numStr = Strings.toString(_num);
        uint256 numDigits = bytes(numStr).length;

        if (numDigits == 1) return string(abi.encodePacked("000", numStr));
        if (numDigits == 2) return string(abi.encodePacked("00", numStr));
        if (numDigits == 3) return string(abi.encodePacked("0", numStr));

        return numStr;
    }
}
