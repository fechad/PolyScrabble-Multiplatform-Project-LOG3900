import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { CurrentFocus } from '@app/classes/current-focus';
import { MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH, ONE_SECOND_IN_MS, SERVER_RESPONSE_DELAY } from '@app/constants/constants';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { SocketEvent } from '@app/enums/socket-event';
import { ChatMessage } from '@app/interfaces/message';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';
import { DEFAULT_USER_NAME, UNRESPONSIVE_SERVER_ERROR } from './constants';
export const SCRABBLE_MESSAGE = '(っ◔◡◔)っ 👑 scrabble 👑';
@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent extends ComponentCommunicationManager implements OnInit {
    @ViewChild('messageInput', { static: true }) private messageInput: ElementRef;
    chatForm: FormGroup;
    isEmojiPickerActive: boolean;
    private messageTimer: number;
    private serverResponded: boolean;
    private messageColor: string;

    constructor(
        protected socketService: SocketClientService,
        private focusHandlerService: FocusHandlerService,
        private fb: FormBuilder,
        protected themeService: ThemeService,
    ) {
        super(socketService);
        this.chatForm = this.fb.group({
            message: ['', [Validators.required, Validators.minLength(MIN_MESSAGE_LENGTH), Validators.maxLength(MAX_MESSAGE_LENGTH)]],
            chatHistory: this.fb.array([]),
        });
        this.messageColor = MessageSenderColors.PLAYER1;
        this.isEmojiPickerActive = false;
    }

    get chatHistory(): FormArray {
        return this.chatForm.get('chatHistory') as FormArray;
    }

    get message(): FormControl {
        return this.chatForm.controls.message as FormControl;
    }

    ngOnInit() {
        let isFirstReload = true;

        this.connectSocket();

        this.focusHandlerService.currentFocus.subscribe(() => {
            if (!this.focusHandlerService.isCurrentFocus(CurrentFocus.CHAT)) {
                this.closeEmojiPicker();
                return;
            }
            this.messageInput.nativeElement.focus();
        });
        this.focusHandlerService.clientChatMessage.subscribe((message: string) => {
            if (isFirstReload) {
                isFirstReload = false;
                return;
            }
            this.addMessage({ text: message, sender: DEFAULT_USER_NAME, color: this.messageColor });
        });
    }

    addMessage(message: ChatMessage) {
        if (this.isMessageValid(message)) {
            this.chatHistory.push(this.fb.control(message));
        }
    }
    sendScrabbleMessage() {
        this.addMessage({ text: SCRABBLE_MESSAGE, sender: DEFAULT_USER_NAME, color: this.messageColor });
        this.sendToRoom(SCRABBLE_MESSAGE);
        this.closeEmojiPicker();
    }

    handleSubmit() {
        if (!this.chatForm.valid) return;
        this.addMessage({ text: this.message.value, sender: DEFAULT_USER_NAME, color: this.messageColor });
        this.sendToRoom(this.message.value);
        this.clearMessage();
        this.closeEmojiPicker();
    }

    sendToRoom(text: string) {
        this.socketService.send(SocketEvent.Message, text);
        this.waitServerResponse();
    }

    updateFocus(event: MouseEvent) {
        event.stopPropagation();
        this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
    }

    openEmojiPicker() {
        if (this.isEmojiPickerActive) {
            this.closeEmojiPicker();
            return;
        }
        this.isEmojiPickerActive = true;
    }

    handleEmojiEvent(emoji: string) {
        const currentText = this.chatForm.controls.message.value;
        this.chatForm.controls.message.setValue(currentText + emoji);
    }

    closeEmojiPicker() {
        if (this.isEmojiPickerActive) {
            this.isEmojiPickerActive = false;
        }
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.Message, (roomMessage: ChatMessage) => {
            this.addMessage(roomMessage);
        });
        this.socketService.on(SocketEvent.MessageReceived, () => {
            this.serverResponded = true;
        });
    }

    private waitServerResponse() {
        this.messageTimer = 0;
        this.serverResponded = false;
        const timerInterval = setInterval(() => {
            if (this.messageTimer >= SERVER_RESPONSE_DELAY) {
                this.addMessage({ text: UNRESPONSIVE_SERVER_ERROR, sender: 'SYSTEM', color: MessageSenderColors.SYSTEM });
                clearInterval(timerInterval);
                return;
            }
            if (this.serverResponded) {
                clearInterval(timerInterval);
                return;
            }
            this.messageTimer++;
        }, ONE_SECOND_IN_MS);
    }

    private isMessageValid(message: ChatMessage): boolean {
        if (message.sender === '') return false;
        if (!this.isMessageColorValid(message.color)) return false;
        const text = message.text;
        return text.length >= MIN_MESSAGE_LENGTH && text.length <= MAX_MESSAGE_LENGTH;
    }

    private isMessageColorValid(color: string): boolean {
        return (Object.values(MessageSenderColors) as string[]).includes(color);
    }

    private clearMessage() {
        this.chatForm.controls.message.setValue('');
    }
}
