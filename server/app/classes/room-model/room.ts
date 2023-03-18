import { BoardMessage } from '@app/classes/board-model/board-message';
import { BotCommunicationManager } from '@app/classes/bot-communication-manager';
import { Goal } from '@app/classes/goals/goal';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { FILLER_BOT_NAMES } from '@app/constants/virtual-player-constants';
import { BotGreeting } from '@app/enums/bot-greetings';
import { GameLevel } from '@app/enums/game-level';
import { PlacementData } from '@app/interfaces/placement-data';
import { ReachedGoal } from '@app/interfaces/reached-goal';
import { RoomInfo } from '@app/interfaces/room-info';
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
};
export class Room {
    elapsedTime: number;
    players: Player[];
    roomInfo: RoomInfo;
    bots: VirtualPlayer[];
    startDate: Date;
    botCommunicationManager: BotCommunicationManager;
    fillerNamesUsed: string[];
    botsLevel: GameLevel;
    private isFirstGame: boolean;
    private gameManager: GameManager;
    constructor(clientRoom?: Room) {
        this.players = [];
        this.elapsedTime = 0;
        this.startDate = new Date();
        this.fillerNamesUsed = [];

        this.botsLevel = clientRoom ? clientRoom.botsLevel : GameLevel.Adaptive;
        this.bots = [];
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
        if (!this.bots) return;
        // TODO: Find a way to use all bot greetings
        return this.bots[0].greeting;
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
    private isSamePassword(password?: string): boolean {
        if (!password && this.roomInfo.password === '') return true;
        return this.roomInfo.password === password;
    }
}
