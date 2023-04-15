import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_ROOM_NAME, GENERAL_CHAT_NAME } from '@app/constants/constants';
import { DiscussionChannel } from '@app/interfaces/discussion-channel';
import { PlayerService } from '@app/services/player.service';

const MIN_LENGTH_NAME = 3;
const MAX_LENGTH_NAME = 15;
@Component({
    selector: 'app-channel-creation-popup',
    templateUrl: './channel-creation-popup.component.html',
    styleUrls: ['./channel-creation-popup.component.scss'],
})
export class ChannelCreationPopupComponent {
    protected channelForm: FormGroup;
    constructor(
        private dialogRef: MatDialogRef<ChannelCreationPopupComponent>,
        private playerService: PlayerService,
        private formBuilder: FormBuilder,
    ) {
        this.channelForm = this.formBuilder.group({
            name: [
                '',
                [
                    Validators.required,
                    Validators.minLength(MIN_LENGTH_NAME),
                    Validators.maxLength(MAX_LENGTH_NAME),
                    this.uniqueChannelNameValidators(),
                    this.notRoomNameValidators(),
                ],
            ],
        });
    }

    get channelName(): string {
        return this.channelForm.controls.name.value;
    }

    get currentLanguage(): string {
        return this.playerService.account.userSettings.defaultLanguage;
    }

    get isFrenchLanguage(): boolean {
        return this.currentLanguage === 'french' || this.currentLanguage === 'fr';
    }

    get isChannelNameValid(): boolean {
        return this.channelForm.controls.name.valid;
    }

    get isChannelNameInvalid(): boolean {
        return this.channelForm.controls.name.invalid && this.channelForm.controls.name.touched;
    }

    get nameErrors() {
        return this.channelForm.controls.name.errors;
    }

    get invalidChannelNameText(): string {
        if (!this.channelForm.controls.name.touched) return '';
        if (!this.isChannelNameInvalid) return '';
        if (!this.nameErrors) return '';
        if (this.isFrenchLanguage) {
            if (this.nameErrors.isGeneralChatName) return 'Vous ne pouvez pas prendre le nom du canal général';
            if (this.nameErrors.notUniqueChannelNameValue) return "Le nom de votre canal de discussion n'est pas unique";
            if (this.nameErrors.startsWithRoomName) return 'Vous ne pouvez pas avoir un nom de canal de discussion qui commence avec R-';
            if (this.nameErrors.maxlength)
                return `Le nom de canal est trop long. Il doit être en dessous de ${this.nameErrors.maxlength.requiredLength} caractères`;
            if (this.nameErrors.minlength)
                return `Le nom de canal est trop court. Il doit être au dessus de ${this.nameErrors.minlength.requiredLength} caractères`;

            return 'nom invalide';
        }

        if (this.nameErrors.isGeneralChatName) return "You can't take the name of the general discussion channel";
        if (this.nameErrors.notUniqueChannelNameValue) return 'The name of your discussion channel is not unique';
        if (this.nameErrors.startsWithRoomName) return "You can't have a discussion channel's name that starts with R-";
        if (this.nameErrors.maxlength)
            return `The name of the discussion channel is too long. It must be below ${this.nameErrors.maxlength.requiredLength} characters`;
        if (this.nameErrors.minlength)
            return `The name of the discussion channel is too short. It must be above ${this.nameErrors.minlength.requiredLength} characters`;

        return 'Invalid name';
    }

    get availableDiscussionChannels(): DiscussionChannel[] {
        return this.playerService.discussionChannelService.availableChannels;
    }

    uniqueChannelNameValidators(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: unknown } | null => {
            if ((control.value as string).replace(/ /g, '').toLowerCase() === GENERAL_CHAT_NAME.replace(/ /g, '').toLowerCase()) {
                return { isGeneralChatName: true };
            }
            if (this.availableDiscussionChannels.find((channel) => channel.name === control.value)) {
                return { notUniqueChannelNameValue: true };
            } else {
                return null;
            }
        };
    }

    notRoomNameValidators(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: unknown } | null => {
            if ((control.value as string).replace(/ /g, '').toLowerCase().startsWith(DEFAULT_ROOM_NAME.toLowerCase())) {
                return { startsWithRoomName: true };
            } else {
                return null;
            }
        };
    }

    submitChannel() {
        if (!this.channelName) return;
        this.dialogRef.close(this.channelName);
    }

    setPlaceholderAsLabel(labelElement: HTMLLabelElement) {
        labelElement.classList.remove('placeholder');
    }

    setLabelAsPlaceholder(labelElement: HTMLLabelElement, formControlName: string) {
        if (this.channelForm.get(formControlName)?.value) return;
        labelElement.classList.add('placeholder');
    }

    focusInput(inputElement: HTMLInputElement) {
        inputElement.focus();
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
