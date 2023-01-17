import { ChatMessage } from '@app/interfaces/chat-message';
import { Service } from 'typedi';

@Service()
export class ChatMessageService {
    isError: boolean;
    message: ChatMessage;
    constructor() {
        this.isError = false;
        this.message = { text: '', sender: '', color: '' };
    }
    addError(message: string) {
        this.isError = true;
        this.message.text = message;
    }
    restore() {
        this.isError = false;
        this.message.text = '';
    }
}
