import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EMOJIS } from '@app/constants/emojis';

@Component({
    selector: 'app-emojis-picker',
    templateUrl: './emojis-picker.component.html',
    styleUrls: ['./emojis-picker.component.scss'],
})
export class EmojisPickerComponent {
    @Input() isOpen: boolean;
    @Output() emojiEvent: EventEmitter<string>;
    allEmojis;
    constructor() {
        this.isOpen = false;
        this.allEmojis = EMOJIS;
        this.emojiEvent = new EventEmitter<string>();
    }
    emitEmoji(emoji: string) {
        this.emojiEvent.emit(emoji);
    }
}
