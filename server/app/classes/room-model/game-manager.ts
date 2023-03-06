import { BoardMessage } from '@app/classes/board-model/board-message';
import { BoardManipulator } from '@app/classes/board-model/board.manipulator';
import { IndexationTranslator } from '@app/classes/board-model/handlers/indexation.translator';
import { Goal } from '@app/classes/goals/goal';
import { GoalManager } from '@app/classes/goals/goal-manager';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { WordFetcher } from '@app/classes/virtual-placement-logic/word-fetcher';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { COUNT_PLAYER_TURN, DEFAULT_DICTIONARY_PATH } from '@app/constants/constants';
import { DICTIONARY_READER } from '@app/constants/reader-constant';
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
    private wordFetcher: WordFetcher;

    constructor(dictionaryName: string = DEFAULT_DICTIONARY_PATH) {
        this.letterBank = new LetterBank();
        this.boardManipulator = new BoardManipulator(this.letterBank.produceValueMap());
        this.turnPassedCounter = 0;
        this.hasTimeout = false;
        this.wordFetcher = new WordFetcher();
        this.wordFetcher.setWordsMap(DICTIONARY_READER.getWords(), dictionaryName);
        this.goalManager = new GoalManager();
        const tools: VirtualTools = {
            fetcher: this.wordFetcher,
            bank: this.letterBank,
            manipulator: this.boardManipulator,
            translator: new IndexationTranslator(),
        };
        this.placementFinder = new PlacementFinder(tools);
    }
    get fetcher(): WordFetcher {
        return this.wordFetcher;
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
        players.forEach((player) => {
            this.goalManager.assignPrivateGoal(player);
        });
        this.goalManager.assignPublicGoals(players);
    }

    getNewVirtualPlayer(name: string, wordFetcher: WordFetcher, desiredLevel: string): VirtualPlayer {
        return new VirtualPlayer(name, false, this.boardManipulator, this.letterBank, wordFetcher, desiredLevel);
    }

    fillPlayersRack(players: Player[]) {
        players.forEach((player) => {
            this.fillPlayerRack(player);
        });
    }

    fillPlayerRack(player: Player) {
        player.rack.insertLetters(this.letterBank.fetchRandomLetters(player.rack.getSpaceLeft()));
    }

    /// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        for (const player of players) {
            if (player.rack.isEmpty()) return true;
        }
        return false;
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
            if (!player || !player.rack || !this.letterBank) {
                continue;
            }
            if (player.pseudo === winner.pseudo) {
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
