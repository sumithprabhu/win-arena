// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract WinArena is Ownable {
    IERC20 public stablecoin;
    uint256 public winConversionRate = 10;
    uint256 public gameDuration = 1 days;

    struct Game {
        uint256 winEntryFee;
        uint256 leaderboardType;
        uint256 startTime;
        uint256 lockedWinPool;
        bool active;
    }

    struct ScoreEntry {
        address player;
        uint256 score;
    }

    mapping(address => uint256) public users; // Stores win balance directly
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

    event UserRegistered(address indexed user, bytes32 username);
    event StablecoinDeposited(
        address indexed user,
        uint256 amount,
        uint256 winPoints
    );
    event GameCreated(uint256 gameId, uint256 winEntryFee);
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

    function depositStablecoin(uint256 _amount) external {
        require(
            stablecoin.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        uint256 winPoints = _amount * winConversionRate;
        users[msg.sender] += winPoints; // Directly update win balance

        emit StablecoinDeposited(msg.sender, _amount, winPoints);
    }

    function withdrawStablecoin(uint256 _winAmount) external {
        require(
            users[msg.sender] >= _winAmount, // Direct check since users[msg.sender] holds balance
            "Insufficient WIN balance"
        );

        uint256 stablecoinAmount = _winAmount / winConversionRate;
        require(
            stablecoin.balanceOf(address(this)) >= stablecoinAmount,
            "Not enough stablecoins in contract"
        );

        users[msg.sender] -= _winAmount; // Directly subtract from balance
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

    function createGame(uint256 _winEntryFee, uint256 _leaderboardType)
        external
        onlyOwner
    {
        require(
            _leaderboardType < totalLeaderboardTypes,
            "Invalid leaderboard type"
        );

        games[totalGames] = Game(
            _winEntryFee,
            _leaderboardType,
            block.timestamp,
            0,
            false
        );
        totalGames++;

        emit GameCreated(totalGames - 1, _winEntryFee);
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
        require(games[_gameId].active, "Game not active");
        require(
            users[msg.sender] >= games[_gameId].winEntryFee,
            "Insufficient WIN points"
        );
        require(!gameParticipants[_gameId][msg.sender], "Already entered");

        users[msg.sender] -= games[_gameId].winEntryFee; // Directly deduct win balance
        games[_gameId].lockedWinPool += games[_gameId].winEntryFee;
        gameParticipants[_gameId][msg.sender] = true;

        emit GameEntered(msg.sender, _gameId, games[_gameId].winEntryFee);
    }

    function updateScore(uint256 _gameId, uint256 _score) external {
        require(
            gameParticipants[_gameId][msg.sender],
            "User not entered in game"
        );

        if (_score > userScores[_gameId][msg.sender]) {
            userScores[_gameId][msg.sender] = _score;

            ScoreEntry[] storage scores = leaderboards[_gameId];
            bool found = false;

            for (uint256 i = 0; i < scores.length; i++) {
                if (scores[i].player == msg.sender) {
                    scores[i].score = _score;
                    found = true;
                    break;
                }
            }

            if (!found) {
                scores.push(ScoreEntry(msg.sender, _score));
            }

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
                users[scores[i].player] += (totalWinPool * rewards[i]) / 100; // Directly add to user's balance
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
            uint256 winEntryFee,
            uint256 leaderboardType,
            uint256 startTime,
            uint256 lockedWinPool,
            bool active
        )
    {
        Game storage game = games[_gameId];

        return (
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
}
