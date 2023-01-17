/* eslint-disable max-lines */ // lot of tests to be sure that the chat work correctly
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrentFocus } from '@app/classes/current-focus';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH, TIMER_TEST_DELAY } from '@app/constants/constants';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { ChatMessage } from '@app/services/message';
import { SocketClientService } from '@app/services/socket-client.service';
import { Socket } from 'socket.io-client';
import { ChatComponent, SCRABBLE_MESSAGE } from './chat.component';
import { DEFAULT_USER_NAME, SYSTEM_NAME } from './constants';

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        return;
    }
}

describe('ChatComponent', () => {
    let component: ChatComponent;
    // we want to test private methods
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let componentPrivateAccess: any;

    let fixture: ComponentFixture<ChatComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let mouseEvent: MouseEvent;
    let focusHandlerService: FocusHandlerService;
    const validText = 'HELLO';
    const validColor: string = MessageSenderColors.SYSTEM;
    const validMessage1: ChatMessage = { text: validText, sender: SYSTEM_NAME, color: validColor };
    const validMessage2: ChatMessage = { text: validText, sender: 'adversary', color: MessageSenderColors.PLAYER1 };
    const invalidMessage: ChatMessage = { text: '', sender: '', color: '' };

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        focusHandlerService = new FocusHandlerService();
        await TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [ReactiveFormsModule, FormsModule],
            providers: [
                { provide: FormBuilder },
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: FocusHandlerService, useValue: focusHandlerService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();
        componentPrivateAccess = component;
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

    it('should focus on the input message when the chat is on focus', () => {
        // eslint-disable-next-line dot-notation -- we need to access the private attribute for the test
        const spy = spyOn(component['messageInput'].nativeElement, 'focus');
        focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });
    it('should not focus on the input message when the chat is not on focus', () => {
        // eslint-disable-next-line dot-notation -- we need to access the private attribute for the test
        const spy = spyOn(component['messageInput'].nativeElement, 'focus');
        focusHandlerService.currentFocus.next(CurrentFocus.NONE);
        component.ngOnInit();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should call addMessage when the clientChat message of the focusHandler change', () => {
        const spy = spyOn(component, 'addMessage');
        focusHandlerService.clientChatMessage.next('test');
        expect(spy).toHaveBeenCalled();
        expect(focusHandlerService.clientChatMessage.value).toEqual('test');
    });

    describe('Receiving events', () => {
        it('should call component.addMessage on message', () => {
            componentPrivateAccess.configureBaseSocketFeatures();
            const spy = spyOn(component, 'addMessage');
            socketHelper.peerSideEmit('message', validMessage1);
            expect(spy).toHaveBeenCalled();
        });

        it('should set component.serverResponded to true on messageReceived', () => {
            componentPrivateAccess.configureBaseSocketFeatures();
            // We need to access the private attribute for the test. We don't want to modify the code just for the tests
            // eslint-disable-next-line dot-notation
            componentPrivateAccess['serverResponded'] = false;
            socketHelper.peerSideEmit('messageReceived');
            // We need to access the private attribute for the test. We don't want to modify the code just for the tests
            // eslint-disable-next-line dot-notation
            expect(componentPrivateAccess['serverResponded']).toBeTruthy();
        });
    });

    describe('ChatHistory tests', () => {
        it('should not create the chat history with preexisting messages', () => {
            expect(component.chatHistory.length).toEqual(0);
        });
        it('should store the messages chronologically', () => {
            component.addMessage(validMessage1);
            component.addMessage(validMessage2);
            const message1 = component.chatHistory.controls[0].value;
            const message2 = component.chatHistory.controls[1].value;
            expect(message1).toEqual(validMessage1);
            expect(message2).toEqual(validMessage2);
        });
    });

    describe('addMessage() tests', () => {
        it('should add a valid message to the chat history', () => {
            component.addMessage(validMessage1);
            const content = component.chatHistory.controls[0].value;
            expect(component.chatHistory.length).toEqual(1);
            expect(content).toEqual(validMessage1);
        });

        it('should not add an invalid message to the chat history', () => {
            const nMessagesInitial = component.chatHistory.length;
            component.addMessage(invalidMessage);
            expect(component.chatHistory.length).toEqual(nMessagesInitial);
        });
        it('should add the message in the chat history (locally) when the socket is not alive', () => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
            component.addMessage(validMessage1);
            expect(component.chatHistory.length).toEqual(1);
            expect(component.chatHistory.controls[0].value).toEqual(validMessage1);
        });
        it('should not be possible to add an empty message with a valid color, sender', () => {
            const initialChatLength = component.chatHistory.length;
            const message: ChatMessage = { text: '', color: validColor, sender: SYSTEM_NAME };
            component.addMessage(message);
            expect(component.chatHistory.length).toEqual(initialChatLength);
        });

        it('should add a valid message to the chat history', () => {
            const initialChatLength = component.chatHistory.length;
            component.addMessage(validMessage1);
            expect(component.chatHistory.length).toEqual(initialChatLength + 1);
            expect(component.chatHistory.controls[0].value).toEqual(validMessage1);
        });

        it('should not add a message that does not have a sender', () => {
            const initialChatLength = component.chatHistory.length;
            const message: ChatMessage = { text: validText, color: validColor, sender: '' };
            component.addMessage(message);
            expect(component.chatHistory.length).toEqual(initialChatLength);
        });

        it('should add a message when the color is valid', () => {
            const initialChatLength = component.chatHistory.length;
            const message: ChatMessage = { text: validText, color: MessageSenderColors.SYSTEM, sender: SYSTEM_NAME };
            component.addMessage(message);
            expect(component.chatHistory.length).toEqual(initialChatLength + 1);
            expect(component.chatHistory.controls[0].value).toEqual(message);
        });

        it('should not add a message when the color is not valid ', () => {
            const initialChatLength = component.chatHistory.length;
            const message: ChatMessage = { text: validText, color: 'fakeColor', sender: SYSTEM_NAME };
            component.addMessage(message);
            expect(component.chatHistory.length).toEqual(initialChatLength);
        });
    });

    describe('form validity tests', () => {
        it('the form should be invalid when created', () => {
            expect(component.chatForm.valid).toBeFalsy();
        });

        it('the form should be valid when the message is valid', () => {
            const message = component.chatForm.controls.message;
            message.setValue(validText);
            expect(message.valid).toBeTruthy();
            expect(component.chatForm.valid).toBeTruthy();
        });

        it('the form should not have a valid message when create', () => {
            const message = component.chatForm.controls.message;
            expect(message.valid).toBeFalsy();
        });

        it('the required validator for the message should be failing', () => {
            const message = component.chatForm.controls.message;
            const errors = message.errors || {};
            expect(errors.required).toBeTruthy();
        });

        it('message of length equal to the maximal length should be valid', () => {
            const message = component.chatForm.controls.message;
            const text = 'c'.repeat(MAX_MESSAGE_LENGTH);
            message.setValue(text);
            expect(message.valid).toBeTruthy();
        });

        it('message should not be valid above a certain length', () => {
            const message = component.chatForm.controls.message;
            const text = 'c'.repeat(MAX_MESSAGE_LENGTH + 1);
            message.setValue(text);
            expect(message.valid).toBeFalsy();
        });

        it('message should not be valid below a certain length', () => {
            const message = component.chatForm.controls.message;
            const text = 'c'.repeat(MIN_MESSAGE_LENGTH - 1);
            message.setValue(text);
            expect(message.valid).toBeFalsy();
        });
    });

    describe('chatHistory() getter tests', () => {
        it('should return the chatHistory when calling chatHistory', () => {
            const chatHistorySpy = spyOnProperty(component, 'chatHistory').and.callThrough();
            const chatHistory = component.chatForm.get('chatHistory') as FormArray;
            expect(component.chatHistory).toBe(chatHistory);
            expect(chatHistorySpy).toHaveBeenCalled();
        });
    });

    describe('message() getter tests', () => {
        it('should return the message when calling message', () => {
            const messageSpy = spyOnProperty(component, 'message').and.callThrough();
            const message = component.chatForm.get('message') as FormControl;
            expect(component.message).toBe(message);
            expect(messageSpy).toHaveBeenCalled();
        });
    });

    describe('handleSubmit() tests', () => {
        it('handleSubmit should call sendToRoom when the chat form is valid', () => {
            // eslint-disable-next-line dot-notation  -- we need to access the private attribute
            component.chatForm.controls.message.setValue(validText);
            const sendToRoomSpy = spyOn(component, 'sendToRoom').and.callThrough();
            component.handleSubmit();
            expect(sendToRoomSpy).toHaveBeenCalled();
        });
        it('handleSubmit should call closeEmojiPicker when the chat form is valid', () => {
            // eslint-disable-next-line dot-notation  -- we need to access the private attribute
            component.chatForm.controls.message.setValue(validText);
            const sendToRoomSpy = spyOn(component, 'closeEmojiPicker').and.callThrough();
            component.handleSubmit();
            expect(sendToRoomSpy).toHaveBeenCalled();
        });
        it('handleSubmit should not call sendToRoom when the chat form is invalid', () => {
            const sendToRoomSpy = spyOn(component, 'sendToRoom').and.callThrough();
            component.handleSubmit();
            expect(sendToRoomSpy).not.toHaveBeenCalled();
        });
        it('handleSubmit should call addMessage when called with the right parameters', () => {
            const message = component.chatForm.controls.message;
            message.setValue(validText);
            const addMessageSpy = spyOn(component, 'addMessage').and.callThrough();
            component.handleSubmit();
            expect(addMessageSpy).toHaveBeenCalled();
            // We need to access the private attribute for the test. We don't want to modify the code just for the tests
            // eslint-disable-next-line dot-notation
            expect(addMessageSpy).toHaveBeenCalledWith({ text: validText, sender: DEFAULT_USER_NAME, color: component['messageColor'] });
        });
        it('calling handleSubmit should clear a non-empty message entered', () => {
            const message = component.chatForm.controls.message;
            message.setValue('I will win this game, just saying');
            component.handleSubmit();
            expect(message.value).toEqual('');
        });
        it('An empty message should remain empty after calling handleSubmit', () => {
            const message = component.chatForm.controls.message;
            message.setValue('');
            component.handleSubmit();
            expect(message.value).toEqual('');
        });
    });

    describe('configureBaseSocketFeatures() receiving events test', () => {
        it('should handle message event with a ChatMessage from the server and call addMessage ', () => {
            componentPrivateAccess.configureBaseSocketFeatures();
            const addMessageSpy = spyOn(componentPrivateAccess, 'addMessage');
            socketHelper.peerSideEmit('message', validMessage1);
            expect(addMessageSpy).toHaveBeenCalled();
        });
        it('should not add an invalid message when it comes from the server with the "message" event', () => {
            const nMessagesInitial = componentPrivateAccess.chatHistory.length;
            componentPrivateAccess.configureBaseSocketFeatures();
            socketHelper.peerSideEmit('message', invalidMessage);
            expect(componentPrivateAccess.chatHistory.length).toEqual(nMessagesInitial);
        });
        it('should add an valid message when it comes from the server with the "message" event', () => {
            const nMessagesInitial = componentPrivateAccess.chatHistory.length;
            componentPrivateAccess.configureBaseSocketFeatures();
            socketHelper.peerSideEmit('message', validMessage1);
            expect(componentPrivateAccess.chatHistory.length).toEqual(nMessagesInitial + 1);
        });
    });

    describe('sendToRoom() test', () => {
        it('should send a message event with the value of the string passed in the parameters', () => {
            const spy = spyOn(socketServiceMock, 'send');
            const eventName = 'message';
            component.sendToRoom('hola');
            expect(spy).toHaveBeenCalledWith(eventName, 'hola');
        });

        it('should add an error message on sendToRoom if it does not get an answer after SERVER_RESPONSE_DELAY ', (done) => {
            const spy = spyOn(component, 'addMessage');
            component.sendToRoom('hola');
            setTimeout(() => {
                expect(spy).toHaveBeenCalled();
                done();
            }, TIMER_TEST_DELAY);
        });

        it('should not add an error message on sendToRoom if it get an answer before SERVER_RESPONSE_DELAY ', (done) => {
            const spy = spyOn(component, 'addMessage');
            component.sendToRoom('hola');
            // We need to access the private attribute for the test. We don't want to modify the code just for the tests
            // eslint-disable-next-line dot-notation
            component['serverResponded'] = true;
            setTimeout(() => {
                expect(spy).not.toHaveBeenCalled();
                done();
            }, TIMER_TEST_DELAY);
        });
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

    describe('sendScrabbleMessageTests() tests', () => {
        it('should call addMessage', () => {
            const spy = spyOn(component, 'addMessage');
            component.sendScrabbleMessage();
            expect(spy).toHaveBeenCalled();
        });
        it('should call sendToRoom with the scrabble message', () => {
            const spy = spyOn(component, 'sendToRoom');
            component.sendScrabbleMessage();
            expect(spy).toHaveBeenCalledWith(SCRABBLE_MESSAGE);
        });
        it('should call closeEmojiPicker', () => {
            const spy = spyOn(component, 'closeEmojiPicker');
            component.sendScrabbleMessage();
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('closeEmojiPicker() tests', () => {
        it('should close the emojiPicker when it is open', () => {
            component.isEmojiPickerActive = true;
            component.closeEmojiPicker();
            expect(component.isEmojiPickerActive).toBeFalse();
        });
        it('should close the emojiPicker when it is not open', () => {
            component.isEmojiPickerActive = false;
            component.closeEmojiPicker();
            expect(component.isEmojiPickerActive).toBeFalse();
        });
    });
    describe('openEmojiPicker() tests', () => {
        it('should close the emojiPicker when it is open', () => {
            component.isEmojiPickerActive = true;
            component.openEmojiPicker();
            expect(component.isEmojiPickerActive).toBeFalse();
        });
        it('should open the emojiPicker when it is closed', () => {
            component.isEmojiPickerActive = false;
            component.openEmojiPicker();
            expect(component.isEmojiPickerActive).toBeTrue();
        });
    });
    describe('handleEmojiEvent() tests', () => {
        it('should add the emoji to the current message input', () => {
            component.chatForm.controls.message.setValue(validText);
            component.handleEmojiEvent('😚');
            // eslint-disable-next-line dot-notation  -- message is private and we need to access it
            expect(component.chatForm.controls['message'].value).toEqual(validText + '😚');
        });
    });
    describe('connect() tests', () => {
        it('should call configureBaseSocketFeatures if the socket is alive', () => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
            componentPrivateAccess.connect();
            expect(spy).toHaveBeenCalled();
        });

        it('should try to reconnect if the socket is not alive', () => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
            const spy = spyOn(componentPrivateAccess, 'tryReconnection');
            componentPrivateAccess.connect();
            expect(spy).toHaveBeenCalled();
        });

        it('should reconnect if the socket is alive', (done) => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
            componentPrivateAccess.tryReconnection();

            setTimeout(() => {
                expect(spy).toHaveBeenCalled();
                done();
            }, TIMER_TEST_DELAY);
        });

        it('should not reconnect if the socket is not alive after 5 sec', (done) => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
            const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
            componentPrivateAccess.tryReconnection();

            setTimeout(() => {
                expect(spy).not.toHaveBeenCalled();
                done();
            }, TIMER_TEST_DELAY);
        });
    });
});
