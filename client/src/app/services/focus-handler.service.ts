import { Injectable } from '@angular/core';
import { CurrentFocus } from '@app/classes/current-focus';
import { BehaviorSubject } from 'rxjs';

const DEFAULT_FOCUS = CurrentFocus.CHAT;
@Injectable({
    providedIn: 'root',
})
export class FocusHandlerService {
    currentFocus: BehaviorSubject<string>;
    clientChatMessage: BehaviorSubject<string>;

    constructor() {
        this.currentFocus = new BehaviorSubject('');
        this.clientChatMessage = new BehaviorSubject('');
        this.currentFocus.next(DEFAULT_FOCUS);
    }

    isCurrentFocus(currentFocus: CurrentFocus) {
        return this.currentFocus.value === currentFocus;
    }
}
