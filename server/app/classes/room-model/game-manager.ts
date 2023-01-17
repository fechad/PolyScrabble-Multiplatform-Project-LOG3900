import { BoardManipulator2990 } from '@app/classes/board-model/board-manipulator-2990';
import { BoardMessage } from '@app/classes/board-model/board-message';
import { BoardManipulator } from '@app/classes/board-model/board.manipulator';
import { IndexationTranslator } from '@app/classes/board-model/handlers/indexation.translator';
import { Goal } from '@app/classes/goals/goal';
import { GoalManager } from '@app/classes/goals/goal-manager';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { DictionaryReader } from '@app/classes/readers/dictionary-reader';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { WordFetcher } from '@app/classes/virtual-placement-logic/word-fetcher';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { COUNT_PLAYER_TURN, DEFAULT_DICTIONARY_PATH } from '@app/constants/constants';
import { PlacementData } from '@app/interfaces/placement-data';
import { ReachedGoal } from '@app/interfaces/reached-goal';
import { VirtualTools } from '@app/interfaces/virtual-tools';
export class GameManager {
    turnPassedCounter: number;
    hasTimeout: boolean;
    placementFinder: PlacementFinder;
    boardManipulator: BoardManipulator | BoardManipulator2990;
    goalManager: GoalManager;
    private letterBank: LetterBank;
    private wordFetcher: WordFetcher;
    private is2990: boolean;

    constructor(dictionaryName: string = DEFAULT_DICTIONARY_PATH, is2990: boolean) {
        this.letterBank = new LetterBank();
        this.boardManipulator = new BoardManipulator(this.letterBank.produceValueMap(), dictionaryName);
        if (is2990) {
            this.boardManipulator = new BoardManipulator2990(this.letterBank.produceValueMap(), dictionaryName);
            this.is2990 = is2990;
        }
        this.turnPassedCounter = 0;
        this.hasTimeout = false;
        this.wordFetcher = new WordFetcher();
        this.wordFetcher.setWordsMap(new DictionaryReader(dictionaryName).getWords(), dictionaryName);
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

    getNewVirtualPlayer(socketId: string, name: string, wordFetcher: WordFetcher, desiredLevel: string): VirtualPlayer {
        return new VirtualPlayer(socketId, name, false, this.boardManipulator, this.letterBank, wordFetcher, desiredLevel);
    }

    fillPlayerRack(player: Player) {
        player.rack.insertLetters(this.letterBank.fetchRandomLetters(player.rack.getSpaceLeft()));
    }

    askPlacement(placement: PlacementData, currentPlayer?: Player): BoardMessage {
        if (this.is2990 && currentPlayer) {
            return (this.boardManipulator as BoardManipulator2990).handlePlacementRequest(
                placement.word.split(''),
                placement.row,
                placement.column,
                currentPlayer,
                placement.direction,
            );
        }
        return this.boardManipulator.placeLetters(placement.word.split(''), placement.row, placement.column, placement.direction);
    }

    choseRandomTurn(players: Player[]) {
        if (!this.verifyBothPlayersExist(players)) return;
        const max = 1;
        const playerIndex = Math.floor(Math.random() * (max + 1));

        players[playerIndex].isItsTurn = true;

        if (playerIndex === 0) {
            players[1].isItsTurn = false;
        } else {
            players[0].isItsTurn = false;
        }
    }

    changePlayerTurn(players: Player[]) {
        if (!this.canChangePlayerTurn(players)) return;
        if (players[0].isItsTurn === players[1].isItsTurn) {
            this.choseRandomTurn(players);
        } else {
            players[0].isItsTurn = !players[0].isItsTurn;
            players[1].isItsTurn = !players[1].isItsTurn;
        }
    }

    canChangePlayerTurn(players: Player[]): boolean {
        if (this.turnPassedCounter >= COUNT_PLAYER_TURN) {
            return false;
        }
        if (!this.verifyBothPlayersExist(players)) return false;
        return true;
    }

    getCurrentPlayerTurn(players: Player[]): Player | undefined {
        if (!this.verifyBothPlayersExist(players)) return;
        return players[0].isItsTurn ? players[0] : players[1];
    }

    verifyBothPlayersExist(players: Player[]): boolean {
        if (players.length !== 2) return false;
        if (!players[0] || !players[1]) return false;
        return true;
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

        if (players[0].points > players[1].points) {
            winnerArray.push(players[0]);
        } else if (players[0].points < players[1].points) {
            winnerArray.push(players[1]);
        } else {
            winnerArray.push(players[0]);
            winnerArray.push(players[1]);
        }
        return winnerArray;
    }
}
