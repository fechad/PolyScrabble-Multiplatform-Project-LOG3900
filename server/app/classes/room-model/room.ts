import { BoardMessage } from '@app/classes/board-model/board-message';
import { BotCommunicationManager } from '@app/classes/bot-communication-manager';
import { Goal } from '@app/classes/goals/goal';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { FILLER_BOT_NAMES } from '@app/constants/virtual-player-constants';
import { GameLevel } from '@app/enums/game-level';
import { PlacementData } from '@app/interfaces/placement-data';
import { ReachedGoal } from '@app/interfaces/reached-goal';
import { RoomInfo } from '@app/interfaces/room-info';
import { RoomObserver } from '@app/interfaces/room-observer';
import { GameManager } from './game-manager';
const MULTIPLAYER_MIN_PLAYERS = 4;

const DEFAULT_ROOM = {
    name: '',
    creatorName: '',
    timerPerTurn: '',
    dictionary: DEFAULT_DICTIONARY_TITLE,
    gameType: '',
    maxPlayers: 4,
    surrender: '',
    isPublic: true,
    password: '',
    isSolo: false,
};
export class Room {
    elapsedTime: number; // elapsedTime must be 0 only before the start of the game. Once it starts, it can't be 0 again. (so 1 to timerPerTurn)
    players: Player[];
    observers: RoomObserver[];
    roomInfo: RoomInfo;
    bots: VirtualPlayer[];
    startDate: Date;
    botCommunicationManager: BotCommunicationManager;
    fillerNamesUsed: string[];
    botsLevel: GameLevel;
    leavers: Player[];
    private placementsData: PlacementData[];
    private isFirstGame: boolean;
    private gameManager: GameManager;
    constructor(clientRoom?: Room) {
        this.players = [];
        this.observers = [];
        this.placementsData = [];
        this.elapsedTime = 0;
        this.startDate = new Date();
        this.fillerNamesUsed = [];
        this.botsLevel = clientRoom ? clientRoom.botsLevel : GameLevel.Adaptive;
        this.bots = [];
        this.leavers = [];
        this.roomInfo = !clientRoom
            ? DEFAULT_ROOM
            : {
                  name: clientRoom.roomInfo.creatorName + ' fiesta',
                  creatorName: clientRoom.roomInfo.creatorName,
                  timerPerTurn: clientRoom.roomInfo.timerPerTurn,
                  dictionary: clientRoom.roomInfo.dictionary,
                  gameType: clientRoom.roomInfo.gameType,
                  maxPlayers: 4,
                  surrender: '',
                  isPublic: clientRoom.roomInfo.isPublic,
                  password: clientRoom.roomInfo.password,
                  isSolo: clientRoom.roomInfo.isSolo,
              };
        this.gameManager = new GameManager();
        this.botCommunicationManager = new BotCommunicationManager();

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

    reset() {
        this.players = [];
        this.bots = [];
        this.fillerNamesUsed = [];
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

    addPlayer(player: Player, password: string) {
        if (this.canAddPlayer(password)) {
            this.players.push(player);
        }

        if (this.isFirstGame && this.players.length !== 0) {
            this.isFirstGame = false;
            this.startDate = new Date();
        }
    }

    addObserver(observer: RoomObserver) {
        if (!this.canAddObserver(observer.username)) return;
        this.observers.push(observer);
    }

    canAddPlayer(password?: string): boolean {
        if (this.roomInfo.isPublic && this.isSamePassword(password) && this.players.length < this.maxPlayers) return true;
        if (!this.roomInfo.isPublic && this.players.length < this.maxPlayers) return true;
        return false;
    }

    canAddObserver(username: string, password?: string): boolean {
        if (this.getObserverByName(username)) return false;
        if (this.roomInfo.isPublic && this.isSamePassword(password)) return true;
        return false;
    }

    createVirtualPlayer(name: string): VirtualPlayer {
        const bot = this.gameManager.getNewVirtualPlayer(name, this.botsLevel);
        bot.registerObserver(this.botCommunicationManager);
        this.addPlayer(bot, this.roomInfo.password);
        bot.sendGreeting();
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

    fillWithVirtualPlayers() {
        if (this.isSolo) return;
        let currentCount = this.players.length;
        while (currentCount < MULTIPLAYER_MIN_PLAYERS) {
            const fillerName = FILLER_BOT_NAMES[this.fillerNamesUsed.length];
            this.fillerNamesUsed.push(fillerName);
            this.createVirtualPlayer(fillerName);
            currentCount++;
        }
    }

    removePlayer(player: Player) {
        const playerToRemove = this.players.find((element) => element.socketId === player.socketId);
        if (!playerToRemove) return;
        if (playerToRemove === this.getCurrentPlayerTurn()) this.changePlayerTurn();
        if (playerToRemove) this.players.splice(this.players.indexOf(playerToRemove), 1);

        if (this.elapsedTime <= 0) return;
        this.punishUnfairGiveUp(playerToRemove);
        this.leavers.push(playerToRemove);
    }

    removeObserver(username: string) {
        const observerToRemove = this.getObserverByName(username);
        if (!observerToRemove) return;
        this.observers.splice(this.observers.indexOf(observerToRemove), 1);
    }

    askPlacement(placement: PlacementData): BoardMessage {
        return this.gameManager.askPlacement(placement);
    }

    getObserver(observerSocketId: string): RoomObserver | undefined {
        return this.observers.find((observer) => observer.socketId === observerSocketId);
    }

    getObserverByName(username: string): RoomObserver | undefined {
        return this.observers.find((observer) => observer.username === username);
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
        this.elapsedTime = 1;
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

    hasARealPlayerLeft(): boolean {
        return this.players.find((player: Player) => player instanceof VirtualPlayer === false) ? true : false;
    }

    computeAverageHumanPoints(): number {
        const humansCount = this.players.filter((player) => !(player instanceof VirtualPlayer)).length;
        return (
            this.players.reduce((total, player) => {
                return player instanceof VirtualPlayer ? total : total + player.points;
            }, 0) / humansCount
        );
    }

    addPlacementData(placementData: PlacementData) {
        this.placementsData.push(placementData);
    }

    private punishUnfairGiveUp(player: Player) {
        if (this.hasARealPlayerLeft()) {
            player.gaveUpUnfairly = true;
            return;
        }
        if (this.isSolo) player.gaveUpUnfairly = true;
    }
    private isSamePassword(password?: string): boolean {
        if (!password && this.roomInfo.password === '') return true;
        return this.roomInfo.password === password;
    }
}
