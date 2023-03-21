import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HintShowerComponent } from '@app/components/hint-shower/hint-shower.component';
import { Hint } from '@app/interfaces/hint';
import { FocusHandlerService } from './focus-handler.service';

@Injectable({
    providedIn: 'root',
})
export class HintService {
    nbHints: number;
    hintValue: number;
    currentHint: number;
    hints: string[];
    hideFraction: boolean;

    constructor(private focusHandlerService: FocusHandlerService, private dialog: MatDialog) {
        this.hintValue = 0;
        this.currentHint = 0;
        this.hideFraction = true;
    }

    showHint() {
        if (!this.hints) {
            return;
        }
        const dialog = this.dialog.open(HintShowerComponent, {
            width: '500',
            autoFocus: true,
            data: { hints: this.hints } as Hint,
        });
        dialog.afterClosed().subscribe(async (result) => {
            this.focusHandlerService.showHint.next(result);
        });
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
