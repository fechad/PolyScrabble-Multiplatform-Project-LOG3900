import { BoardManipulator } from '@app/classes/board-model/board-manipulator';
import { IndexationTranslator } from '@app/classes/board-model/handlers/indexation.translator';
import { BoardNode } from '@app/classes/board-model/nodes/board-node';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { CENTRAL_COLUMN_INDEX, DEFAULT_CENTRAL_ROW } from '@app/constants/board-constants';
import { RACK_CAPACITY } from '@app/constants/constants';
import { DEFAULT_MAX_GAP, SCALES } from '@app/constants/virtual-player-constants';
import { BotGreeting } from '@app/enums/bot-greetings';
import { FullCommandVerbs } from '@app/enums/full-command-verbs';
import { GameLevel } from '@app/enums/game-level';
import { AdaptiveScale } from '@app/interfaces/adaptive-scale';
import { UserPlacement } from '@app/interfaces/user-placement';
import { VirtualBasis } from '@app/interfaces/virtual-basis';
import { VirtualPlayerTools } from '@app/interfaces/virtual-player-tools';
import { VirtualTools } from '@app/interfaces/virtual-tools';
import { IntervalComputer } from './interval-computer';

export class VirtualPlayer extends Player {
    centerNode: BoardNode;
    greeting: BotGreeting;
    protected maxGap: number;
    protected possiblePlacements: UserPlacement[];
    protected basis: VirtualBasis;
    protected tools: VirtualPlayerTools;
    protected intervalComputer: IntervalComputer;

    constructor(
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator,
        letterBank: LetterBank,
        desiredLevel: string = GameLevel.Beginner,
        scale: AdaptiveScale = SCALES.default,
    ) {
        super('', pseudo, isCreator);
        this.basis = { level: desiredLevel, actions: [], scoreIntervals: [] };
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
        this.setGreeting();
    }

    get level(): string {
        return this.basis.level;
    }

    async playTurn(): Promise<string> {
        return (await this.chooseAction()) as string;
    }

    setScoreInterval(gap: number = 0) {
        this.intervalComputer.setScoreInterval(gap);
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
        return `${FullCommandVerbs.PLACE} ${chosenPlacement.row}${chosenPlacement.col}${chosenPlacement.direction} ${chosenPlacement.letters}`;
    }

    protected async chooseAction(): Promise<string> {
        return this.placeLettersAction();
    }

    private setGreeting() {
        this.greeting = BotGreeting[this.pseudo];
        if (this.greeting === undefined) this.greeting = BotGreeting.Generic;
    }
}
