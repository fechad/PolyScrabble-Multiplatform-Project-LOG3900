import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentFocus } from '@app/classes/current-focus';
import { FocusHandlerService } from '@app/services/focus-handler.service';

import { MessagesDisplayComponent } from './messages-display.component';

describe('MessagesDisplayComponent', () => {
    let component: MessagesDisplayComponent;
    let fixture: ComponentFixture<MessagesDisplayComponent>;
    let mouseEvent: MouseEvent;
    let focusHandlerService: FocusHandlerService;

    beforeEach(async () => {
        focusHandlerService = new FocusHandlerService();
        await TestBed.configureTestingModule({
            declarations: [MessagesDisplayComponent],
            providers: [{ provide: ChangeDetectorRef }, { provide: FocusHandlerService, useValue: focusHandlerService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MessagesDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        mouseEvent = {
            button: 0,
            stopPropagation: () => {
                return;
            },
        } as MouseEvent;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('updateFocus() tests', () => {
        it('should not propagate the click event', () => {
            const spy = spyOn(mouseEvent, 'stopPropagation');
            component.updateFocus(mouseEvent);
            expect(spy).toHaveBeenCalled();
        });
        it('should call set the current focus to the chat', () => {
            const spy = spyOn(focusHandlerService.currentFocus, 'next');
            component.updateFocus(mouseEvent);
            expect(spy).toHaveBeenCalledWith(CurrentFocus.CHAT);
        });
    });
});
