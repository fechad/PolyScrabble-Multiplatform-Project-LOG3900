import { BoardMessage } from '@app/classes/board-model/board-message';
import { Goal } from '@app/classes/goals/goal';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { BotGreeting } from '@app/enums/bot-greetings';
import { GameLevel } from '@app/enums/game-level';
import { PlacementData } from '@app/interfaces/placement-data';
import { ReachedGoal } from '@app/interfaces/reached-goal';
import { RoomInfo } from '@app/interfaces/room-info';
import { GameManager } from './game-manager';

export class Room {
    elapsedTime: number;
    players: Player[];
    roomInfo: RoomInfo;
    bot: VirtualPlayer;
    startDate: Date;
    private isFirstGame: boolean;
    private gameManager: GameManager;

    constructor(clientRoom?: Room) {
        this.players = [];
        this.elapsedTime = 0;
        this.startDate = new Date();

        if (clientRoom) {
            this.roomInfo = {
                name: '',
                creatorName: clientRoom.roomInfo.creatorName,
                timerPerTurn: clientRoom.roomInfo.timerPerTurn,
                dictionary: clientRoom.roomInfo.dictionary,
                gameType: clientRoom.roomInfo.gameType,
                maxPlayers: 4,
                surrender: '',
                isPublic: clientRoom.roomInfo.isPublic,
                password: clientRoom.roomInfo.password,
            };
        } else {
            this.roomInfo = {
                name: '',
                creatorName: '',
                timerPerTurn: '',
                dictionary: DEFAULT_DICTIONARY_TITLE,
                gameType: '',
                maxPlayers: 4,
                surrender: '',
                isPublic: true,
                password: '',
            };
        }
        this.gameManager = new GameManager();

        this.isFirstGame = true;
    }

    get turnPassedCounter(): number {
        return this.gameManager.turnPassedCounter;
    }

    get placementFinder(): PlacementFinder {
        return this.gameManager.placementFinder;
    }

    get maxPlayers(): number {
        return this.roomInfo.maxPlayers;
    }

    get isSolo(): boolean | undefined {
        return this.roomInfo.isSolo;
    }

    get letterBank(): LetterBank {
        return this.gameManager.managerLetterBank;
    }

    hasTimer(): boolean {
        return this.gameManager.hasTimeout;
    }

    stopOtherTimerCreation() {
        this.gameManager.hasTimeout = true;
    }

    incrementTurnPassedCounter() {
        this.gameManager.turnPassedCounter++;
    }

    resetTurnPassedCounter() {
        this.gameManager.turnPassedCounter = 0;
    }

    canAddPlayer(password?: string): boolean {
        if (this.roomInfo.isPublic && this.isSamePassword(password) && this.players.length < this.maxPlayers) return true;
        if (!this.roomInfo.isPublic && this.players.length < this.maxPlayers) return true;
        return false;
    }

    addPlayer(player: Player, password: string) {
        if (this.canAddPlayer(password)) {
            this.players.push(player);
        }

        if (this.isFirstGame && this.players.length !== 0) {
            this.isFirstGame = false;
            this.startDate = new Date();
        }
    }

    createPlayerVirtual(name: string, desiredLevel = GameLevel.Beginner): VirtualPlayer {
        const bot = this.gameManager.getNewVirtualPlayer(name, desiredLevel);
        this.bot = bot;
        this.addPlayer(this.bot, this.roomInfo.password);
        return bot;
    }

    givesPlayerGoals() {
        this.gameManager.givePlayerGoals(this.players);
    }

    getAllGoals(): Goal[] {
        return this.gameManager.allGoals;
    }

    getReachedGoals(): ReachedGoal[] {
        return this.gameManager.reachedGoals;
    }

    fillPlayersRack() {
        this.gameManager.fillPlayersRack(this.players);
    }

    fillPlayerRack(player: Player) {
        this.gameManager.fillPlayerRack(player);
    }

    removePlayer(player: Player) {
        const playerToRemove = this.players.find((element) => element.socketId === player.socketId);
        if (playerToRemove === this.getCurrentPlayerTurn()) this.changePlayerTurn();
        if (playerToRemove) {
            this.players.splice(this.players.indexOf(playerToRemove), 1);
        }
    }

    askPlacement(placement: PlacementData): BoardMessage {
        return this.gameManager.askPlacement(placement);
    }

    getPlayer(playerSocketId: string): Player | undefined {
        return this.players.find((element) => element.socketId === playerSocketId);
    }

    getPlayerByName(playerName: string): Player | undefined {
        return this.players.find((element) => element.pseudo === playerName);
    }

    getPlayerName(playerSocketId: string): string | undefined {
        const player = this.getPlayer(playerSocketId);
        if (!player) return;
        return player.pseudo;
    }

    choseRandomTurn() {
        this.gameManager.choseRandomTurn(this.players);
    }

    changePlayerTurn() {
        this.gameManager.changePlayerTurn(this.players);
        this.elapsedTime = 0;
    }

    canChangePlayerTurn(): boolean {
        return this.gameManager.canChangePlayerTurn(this.players);
    }

    getCurrentPlayerTurn(): Player | undefined {
        return this.gameManager.getCurrentPlayerTurn(this.players);
    }

    isGameFinished(): boolean {
        return this.gameManager.isGameFinished(this.players);
    }

    setPlayersTurnToFalse() {
        this.gameManager.setPlayersTurnToFalse(this.players);
    }

    updateScoreOnPassFinish() {
        this.gameManager.updateScoreOnPassFinish(this.players);
    }

    updateScoresOnPlaceFinish(winner: Player) {
        this.gameManager.updateScoresOnPlaceFinish(winner, this.players);
    }

    getWinner(): Player[] {
        return this.gameManager.getWinner(this.players);
    }

    getBotGreeting(): BotGreeting | undefined {
        if (!this.bot) return undefined;
        return this.bot.greeting;
    }

    hasARealPlayerLeft(): boolean {
        return this.players.find((player: Player) => player instanceof VirtualPlayer === false) ? true : false;
    }

    private isSamePassword(password?: string): boolean {
        if (!password && this.roomInfo.password === '') return true;
        return this.roomInfo.password === password;
    }
}
