import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { IndexationTranslator } from '@app/classes/board-model/handlers/indexation.translator';
import { BoardNode } from '@app/classes/board-model/nodes/board-node';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Observable } from '@app/classes/observer-pattern/observable';
import { Observer } from '@app/classes/observer-pattern/observer';
import { Player } from '@app/classes/player';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { CENTRAL_COLUMN_INDEX, DEFAULT_CENTRAL_ROW } from '@app/constants/board-constants';
import { RACK_CAPACITY } from '@app/constants/constants';
import { DEFAULT_BOT_ACCOUNT } from '@app/constants/default-user-settings';
import { BIG_SCORE, DEFAULT_MAX_GAP, EXTREME_SCORE, SCALES } from '@app/constants/virtual-player-constants';
import { FullCommandVerbs } from '@app/enums/full-command-verbs';
import { Language } from '@app/enums/language';
import { DEFAULT_ENGLISH_QUOTES, DEFAULT_FRENCH_QUOTES, Quotes } from '@app/enums/themed-quotes/quotes';
import { AdaptiveScale } from '@app/interfaces/adaptive-scale';
import { UserPlacement } from '@app/interfaces/user-placement';
import { VirtualBasis } from '@app/interfaces/virtual-basis';
import { VirtualPlayerTools } from '@app/interfaces/virtual-player-tools';
import { VirtualTools } from '@app/interfaces/virtual-tools';
import { IntervalComputer } from './interval-computer';

export class VirtualPlayer extends Player implements Observable {
    observers: Observer[];
    centerNode: BoardNode;

    protected maxGap: number;
    protected possiblePlacements: UserPlacement[];
    protected basis: VirtualBasis;
    protected tools: VirtualPlayerTools;
    protected intervalComputer: IntervalComputer;
    protected quotes: Quotes;
    private language: Language;

    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        scale: AdaptiveScale = SCALES.default,
        language: Language = Language.French,
    ) {
        super('', pseudo, isCreator, DEFAULT_BOT_ACCOUNT);
        this.observers = [];
        this.language = language;
        this.basis = { actions: [], scoreIntervals: [] };
        const baseTools: VirtualTools = {
            translator: new IndexationTranslator(),
            manipulator: boardManipulator,
            bank: letterBank,
        };
        this.tools = { ...baseTools, finder: new PlacementFinder(baseTools) };
        this.possiblePlacements = [];
        const centerNode = this.tools.manipulator.askNode(DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX);
        if (!(centerNode instanceof BoardNode)) return;
        this.centerNode = centerNode;
        this.maxGap = DEFAULT_MAX_GAP;
        this.intervalComputer = new IntervalComputer(scale);
        this.setQuotes();
    }
    get greeting(): string {
        return this.quotes.greeting;
    }
    async playTurn(): Promise<string> {
        return (await this.chooseAction()) as string;
    }

    setScoreInterval(gap: number = 0) {
        this.intervalComputer.setScoreInterval(gap);
    }

    sendGreeting() {
        this.sendMessage(this.quotes.greeting);
    }

    sendMessage(message: string, senderOverwrite?: string) {
        this.notifyObservers({ message, sender: senderOverwrite ? senderOverwrite : this.pseudo, avatarUrl: this.avatarUrl });
    }

    registerObserver(observer: Observer) {
        this.observers.push(observer);
    }

    removeObserver(observer: Observer) {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex < 0) return;
        this.observers.splice(observerIndex, 1);
    }

    notifyObservers(data: unknown) {
        for (const observer of this.observers) {
            observer.handleObservableNotification(data);
        }
    }

    setQuotes(frenchQuotes: Quotes = DEFAULT_FRENCH_QUOTES, englishQuotes: Quotes = DEFAULT_ENGLISH_QUOTES): void {
        switch (this.language) {
            case Language.English:
                this.quotes = englishQuotes;
                break;
            case Language.French:
                this.quotes = frenchQuotes;
                break;
            default:
                this.quotes = frenchQuotes;
                break;
        }
    }
    protected passTurnAction(): string {
        return `${FullCommandVerbs.SKIP}`;
    }

    protected switchLettersAction(): string {
        const size = Math.min(this.tools.bank.getLettersCount(), RACK_CAPACITY);
        if (size === 0) return this.passTurnAction();
        return `${FullCommandVerbs.SWITCH} ${this.rack.getLetters().substring(0, size)}`;
    }

    protected placeLettersAction(): string {
        this.possiblePlacements = this.tools.finder.getPlacement(this.rack.getLetters());
        if (this.possiblePlacements.length === 0) return this.switchLettersAction();

        const scoreInterval = this.intervalComputer.scoreInterval;
        let filtered: UserPlacement[];
        let offset = 0;
        do {
            filtered = this.possiblePlacements.filter(
                (placement) => placement.points >= scoreInterval.min - offset && placement.points <= scoreInterval.max + offset,
            );
            offset++;
        } while (filtered.length === 0);
        const chosenPlacement = filtered[Math.floor(Math.random() * filtered.length)];
        if (chosenPlacement.points >= EXTREME_SCORE) this.sendMessage(this.quotes.extremeScore);
        else if (chosenPlacement.points > BIG_SCORE) this.sendMessage(this.quotes.bigScore);

        return `${FullCommandVerbs.PLACE} ${chosenPlacement.row}${chosenPlacement.col}${chosenPlacement.direction} ${chosenPlacement.letters}`;
    }

    protected async chooseAction(): Promise<string> {
        return this.placeLettersAction();
    }
}
