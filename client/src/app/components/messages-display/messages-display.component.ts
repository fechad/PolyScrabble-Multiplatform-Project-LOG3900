import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CurrentFocus } from '@app/classes/current-focus';
import { FocusHandlerService } from '@app/services/focus-handler.service';

@Component({
    selector: 'app-messages-display',
    templateUrl: './messages-display.component.html',
    styleUrls: ['./messages-display.component.scss'],
})
// https://stackoverflow.com/a/59291543
export class MessagesDisplayComponent implements OnInit, AfterViewChecked {
    @Input() messages: AbstractControl[];
    @ViewChild('scrollMe', { static: true }) private myScrollContainer: ElementRef;
    constructor(private changeDetector: ChangeDetectorRef, private focusHandlerService: FocusHandlerService) {}

    ngOnInit() {
        this.scrollToBottom();
        this.focusHandlerService.currentFocus.subscribe(() => {
            return;
        });
    }
    updateFocus(event: MouseEvent) {
        event.stopPropagation();
        this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
    }

    ngAfterViewChecked() {
        this.changeDetector.detectChanges();
    }

    scrollToBottom() {
        this.myScrollContainer.nativeElement.scroll = this.myScrollContainer.nativeElement.scrollHeight;
    }
}
