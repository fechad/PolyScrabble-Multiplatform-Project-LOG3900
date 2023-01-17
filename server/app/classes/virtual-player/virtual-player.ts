import { BoardManipulator2990 } from '@app/classes/board-model/board-manipulator-2990';
import { BoardManipulator } from '@app/classes/board-model/board.manipulator';
import { CENTRAL_COLUMN_INDEX, DEFAULT_CENTRAL_ROW } from '@app/constants/board-constants';
import { IndexationTranslator } from '@app/classes/board-model/handlers/indexation.translator';
import { BoardNode } from '@app/classes/board-model/nodes/board-node';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { Randomiser } from '@app/classes/randomiser';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { WordFetcher } from '@app/classes/virtual-placement-logic/word-fetcher';
import { MAX_RANDOM, RACK_CAPACITY, WEIGHT_10, WEIGHT_30, WEIGHT_40 } from '@app/constants/constants';
import { SCORE_INTERVALS } from '@app/constants/virtual-player-constants';
import { BotGreeting } from '@app/enums/bot-greetings';
import { FullCommandVerbs } from '@app/enums/full-command-verbs';
import { GameLevel } from '@app/enums/game-level';
import { VirtualPlayerActions } from '@app/enums/virtual-player-actions';
import { ScoreInterval } from '@app/interfaces/score-interval';
import { UserPlacement } from '@app/interfaces/user-placement';
import { VirtualBasis } from '@app/interfaces/virtual-basis';
import { VirtualPlayerTools } from '@app/interfaces/virtual-player-tools';
import { VirtualTools } from '@app/interfaces/virtual-tools';
export class VirtualPlayer extends Player {
    centerNode: BoardNode;
    greeting: BotGreeting;
    private possiblePlacements: UserPlacement[];
    private basis: VirtualBasis;
    private tools: VirtualPlayerTools;

    constructor(
        socketId: string,
        pseudo: string,
        isCreator: boolean,
        boardManipulator: BoardManipulator | BoardManipulator2990,
        letterBank: LetterBank,
        wordFetcher: WordFetcher,
        desiredLevel: string = GameLevel.Beginner,
    ) {
        super(socketId, pseudo, isCreator);
        this.basis = { level: desiredLevel, actions: [], scoreIntervals: [] };
        const baseTools: VirtualTools = {
            fetcher: wordFetcher,
            translator: new IndexationTranslator(),
            manipulator: boardManipulator,
            bank: letterBank,
        };
        this.tools = { ...baseTools, finder: new PlacementFinder(baseTools) };
        this.possiblePlacements = [];
        const centerNode = this.tools.manipulator.askNode(DEFAULT_CENTRAL_ROW, CENTRAL_COLUMN_INDEX);
        if (centerNode === undefined) return;
        this.centerNode = centerNode;
        this.setGreeting();
    }
    get wordFetcher(): WordFetcher {
        return this.tools.fetcher;
    }
    get level(): string {
        return this.basis.level;
    }
    async playTurn(): Promise<string> {
        return (await this.chooseAction()) as string;
    }
    private setGreeting() {
        this.greeting = BotGreeting[this.pseudo];
        if (this.greeting === undefined) this.greeting = BotGreeting.Generic;
    }
    private passTurnAction(): string {
        return `${FullCommandVerbs.SKIP}`;
    }

    private switchLettersAction(): string {
        const size = Math.min(this.tools.bank.getLettersCount(), RACK_CAPACITY);
        if (size === 0) return this.passTurnAction();
        return `${FullCommandVerbs.SWITCH} ${this.rack.getLetters().substring(0, size)}`;
    }

    private placeLettersAction(): string {
        let placement;
        const interval = this.getScoreInterval();
        this.possiblePlacements = this.tools.finder.getPlacement(interval, this.rack.getLetters());
        if (this.possiblePlacements.length === 0) {
            this.possiblePlacements = this.tools.finder.getPlacement(SCORE_INTERVALS.any, this.rack.getLetters());
            if (this.possiblePlacements.length === 0) {
                return this.switchLettersAction();
            }
            this.possiblePlacements.sort((a, b) => (a.points || 0) - (b.points || 0));
            placement = this.possiblePlacements[0];
        } else {
            placement = this.possiblePlacements[Math.floor(Math.random() * this.possiblePlacements.length)];
        }
        return `${FullCommandVerbs.PLACE} ${placement.row}${placement.col}${placement.direction} ${placement.letters}`;
    }

    private placeLettersActionExpert(): string {
        this.possiblePlacements = this.tools.finder.getPlacement(SCORE_INTERVALS.any, this.rack.getLetters());
        if (this.possiblePlacements.length === 0) return this.switchLettersAction();

        this.possiblePlacements.sort((leftPlacement, rightPlacement) => (leftPlacement.points || 0) - (rightPlacement.points || 0));
        const placement = this.possiblePlacements[this.possiblePlacements.length - 1];

        return `${FullCommandVerbs.PLACE} ${placement.row}${placement.col}${placement.direction} ${placement.letters}`;
    }

    private async chooseAction(): Promise<string> {
        if (this.basis.level === GameLevel.Beginner) {
            const action = this.getAction();
            if (action === VirtualPlayerActions.PassTurn) {
                return this.passTurnAction();
            }
            if (action === VirtualPlayerActions.SwitchLetters) {
                return this.switchLettersAction();
            }
            if (action === VirtualPlayerActions.PlaceLetters) {
                return this.placeLettersAction();
            }
        } else if (this.basis.level === GameLevel.Expert) {
            return this.placeLettersActionExpert();
        }
        return this.passTurnAction();
    }

    private getAction(): string {
        if (this.basis.actions.length <= 0) {
            this.basis.actions = Randomiser.getDistribution<string>(
                [
                    VirtualPlayerActions.PlaceLetters,
                    VirtualPlayerActions.PassTurn,
                    VirtualPlayerActions.PlaceLetters,
                    VirtualPlayerActions.SwitchLetters,
                ],
                [WEIGHT_40, WEIGHT_10, WEIGHT_40, WEIGHT_10],
                MAX_RANDOM,
            );
        }
        const index = Math.floor(this.basis.actions.length * Math.random());
        const action: string = this.basis.actions[index];
        this.basis.actions.splice(index, 1);
        return action;
    }

    private getScoreInterval(): ScoreInterval {
        if (this.basis.scoreIntervals.length <= 0) {
            this.basis.scoreIntervals = Randomiser.getDistribution<ScoreInterval>(
                [SCORE_INTERVALS.level0, SCORE_INTERVALS.level1, SCORE_INTERVALS.level2],
                [WEIGHT_40, WEIGHT_30, WEIGHT_30],
                MAX_RANDOM,
            );
        }
        const index = Math.floor(this.basis.scoreIntervals.length * Math.random());
        const interval: ScoreInterval = this.basis.scoreIntervals[index];
        this.basis.scoreIntervals.splice(index, 1);

        return interval;
    }
}
