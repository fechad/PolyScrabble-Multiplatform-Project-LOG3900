import { expect } from 'chai';
import { ChatMessageService } from './chat.message';

describe('ChatMessageService tests', () => {
    let chat: ChatMessageService;
    before(async () => {
        chat = new ChatMessageService();
    });

    describe('addError tests', () => {
        it('should add an error correctly when calling addError', () => {
            chat.addError('wrong');
            expect(chat.isError).to.equal(true);
            expect(chat.message.text).to.equal('wrong');
        });
    });
    describe('restore tests', () => {
        it('should remove errors when calling restore', () => {
            chat.addError('wrong');
            chat.restore();
            expect(chat.message.text).to.equal('');
        });
    });
});
