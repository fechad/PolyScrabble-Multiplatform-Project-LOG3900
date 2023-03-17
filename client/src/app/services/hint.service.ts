import { Injectable } from '@angular/core';
import { FocusHandlerService } from './focus-handler.service';

@Injectable({
    providedIn: 'root',
})
export class HintService {
    nbHints: number;
    hintValue: number;
    currentHint: number;
    hints: string[];

    constructor(private focusHandlerService: FocusHandlerService) {
        this.hintValue = 0;
        this.currentHint = 0;
    }

    showHint() {
        if (!this.hints) return;
        const args = this.hints[this.currentHint % (this.hints.length - 2)];
        const test = args.split('_');
        const value = test.pop();
        if (value) this.hintValue = parseInt(value, 10);
        this.focusHandlerService.showHint.next(this.currentHint);
        this.currentHint++;
    }

    handleGamePageHintEvent(data: { text: string }) {
        if (data.text === '0') {
            this.nbHints = 0;
            return;
        }
        this.hints = data.text.split(' ');
        this.nbHints = parseInt(this.hints[this.hints.length - 1], 10);
    }
}
