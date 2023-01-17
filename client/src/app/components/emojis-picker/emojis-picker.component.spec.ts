import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojisPickerComponent } from './emojis-picker.component';

describe('EmojisPickerComponent', () => {
    let component: EmojisPickerComponent;
    let fixture: ComponentFixture<EmojisPickerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EmojisPickerComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EmojisPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('emitEmojiEvent tests', () => {
        it('should emit the emoji', () => {
            const spy = spyOn(component.emojiEvent, 'emit').and.callThrough();
            component.emitEmoji('🔴');
            expect(spy).toHaveBeenCalledWith('🔴');
        });
    });
});
