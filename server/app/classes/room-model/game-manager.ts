/* eslint-disable no-case-declarations */
import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { IndexationTranslator } from '@app/classes/board-model/handlers/indexation.translator';
import { GoalManager } from '@app/classes/goals/goal-manager';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { EinsteinVirtualPlayer } from '@app/classes/virtual-player/themed-virtual-players/einstein-vp';
import { SantaVirtualPlayer } from '@app/classes/virtual-player/themed-virtual-players/santa-vp';
import { SerenaVirtualPlayer } from '@app/classes/virtual-player/themed-virtual-players/serena-vp';
import { TrumpVirtualPlayer } from '@app/classes/virtual-player/themed-virtual-players/trump-vp';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { VirtualPlayerAdaptative } from '@app/classes/virtual-player/virtual-player-adaptative';
import { VirtualPlayerBeginner } from '@app/classes/virtual-player/virtual-player-beginner';
import { VirtualPlayerExpert } from '@app/classes/virtual-player/virtual-player-expert';
import { COUNT_PLAYER_TURN } from '@app/constants/constants';
import { GameLevel } from '@app/enums/game-level';
import { BoardMessage } from '@app/interfaces/board-message';
import { Goal } from '@app/interfaces/goal';
import { PlacementData } from '@app/interfaces/placement-data';
import { ReachedGoal } from '@app/interfaces/reached-goal';
import { VirtualTools } from '@app/interfaces/virtual-tools';

export class GameManager {
    turnPassedCounter: number;
    hasTimeout: boolean;
    placementFinder: PlacementFinder;
    boardManipulator: BoardManipulator;
    goalManager: GoalManager;
    private letterBank: LetterBank;

    constructor() {
        this.letterBank = new LetterBank();
        this.boardManipulator = new BoardManipulator(this.letterBank.produceValueMap());
        this.turnPassedCounter = 0;
        this.hasTimeout = false;
        this.goalManager = new GoalManager();
        const tools: VirtualTools = {
            bank: this.letterBank,
            manipulator: this.boardManipulator,
            translator: new IndexationTranslator(),
        };
        this.placementFinder = new PlacementFinder(tools);
    }
    get allGoals(): Goal[] {
        return this.goalManager.fetchAllGoals();
    }
    get reachedGoals(): ReachedGoal[] {
        return this.goalManager.goalsReached;
    }
    get managerLetterBank(): LetterBank {
        return this.letterBank;
    }
    givePlayerGoals(players: Player[]) {
        this.goalManager.assignPublicGoals(players);
    }

    getNewVirtualPlayer(name: string, desiredLevel: string): VirtualPlayer {
        switch (desiredLevel) {
            case GameLevel.Beginner:
                return new VirtualPlayerBeginner(name, false, this.boardManipulator, this.letterBank);

            case GameLevel.Adaptive:
                return new VirtualPlayerAdaptative(name, false, this.boardManipulator, this.letterBank);

            case GameLevel.Expert:
                return new VirtualPlayerExpert(name, false, this.boardManipulator, this.letterBank);

            case GameLevel.Santa:
                return new SantaVirtualPlayer(name, false, this.boardManipulator, this.letterBank);

            case GameLevel.Trump:
                return new TrumpVirtualPlayer(name, false, this.boardManipulator, this.letterBank);

            case GameLevel.Einstein:
                return new EinsteinVirtualPlayer(name, false, this.boardManipulator, this.letterBank);

            case GameLevel.Serena:
                return new SerenaVirtualPlayer(name, false, this.boardManipulator, this.letterBank);

            default:
                return new VirtualPlayerAdaptative(name, false, this.boardManipulator, this.letterBank);
        }
    }

    fillPlayersRack(players: Player[]) {
        players.forEach((player) => {
            this.fillPlayerRack(player);
        });
    }

    fillPlayerRack(player: Player) {
        player.rack.insertLetters(this.letterBank.fetchRandomLetters(player.rack.getSpaceLeft()));
    }

    askPlacement(placement: PlacementData): BoardMessage {
        return this.boardManipulator.placeLetters(placement.word.split(''), placement.row, placement.column, placement.direction);
    }

    choseRandomTurn(players: Player[]) {
        for (const player of players) {
            player.isItsTurn = false;
        }

        if (players.length <= 1) return;

        const playerIndex = Math.floor(Math.random() * players.length);
        if (!players[playerIndex]) return;
        players[playerIndex].isItsTurn = true;
    }

    changePlayerTurn(players: Player[]) {
        if (!this.canChangePlayerTurn(players)) return;
        const currentPlayerTurn = this.getCurrentPlayerTurn(players);
        if (!currentPlayerTurn) {
            this.choseRandomTurn(players);
            return;
        }

        const currentPlayerIndex = players.indexOf(currentPlayerTurn);
        if (!players[currentPlayerIndex]) return;
        players[currentPlayerIndex].isItsTurn = false;
        players[(currentPlayerIndex + 1) % players.length].isItsTurn = true;
    }

    canChangePlayerTurn(players: Player[]): boolean {
        if (players.length <= 1) return false;
        if (this.turnPassedCounter >= COUNT_PLAYER_TURN) {
            return false;
        }
        return true;
    }

    getCurrentPlayerTurn(players: Player[]): Player | undefined {
        if (players.length <= 1) return;
        return players.find((player: Player) => player.isItsTurn);
    }

    isGameFinished(players: Player[]): boolean {
        if (this.letterBank.getLettersCount() !== 0) return false;
        return players.some((player) => player.rack.isEmpty());
    }

    setPlayersTurnToFalse(players: Player[]) {
        for (const player of players) {
            player.isItsTurn = false;
        }
    }

    updateScoreOnPassFinish(players: Player[]) {
        for (const player of players) {
            if (!player || !player.rack || !this.letterBank) {
                continue;
            }
            player.points -= player.rack.getPointsOfRack(this.letterBank);
        }
    }

    updateScoresOnPlaceFinish(winner: Player, players: Player[]) {
        for (const player of players) {
            if (!player || !player.rack || !this.letterBank || player.pseudo === winner.pseudo) {
                continue;
            }
            const point = player.rack.getPointsOfRack(this.letterBank);
            player.points -= point;
            winner.points += point;
        }
    }

    getWinner(players: Player[]): Player[] {
        const winnerArray: Player[] = [];
        if (players.length <= 1) return [];
        const sortedPlayersByPoints = players.sort((playerA: Player, playerB: Player) => {
            return playerB.points - playerA.points;
        });

        for (const player of sortedPlayersByPoints) {
            if (winnerArray.length === 0) {
                winnerArray.push(player);
                continue;
            }
            if (player.points === winnerArray[0].points) {
                winnerArray.push(player);
            }
        }
        return winnerArray;
    }
}
