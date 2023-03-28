import { BoardMessageContent } from '@app/enums/board-message-content';
import { BoardMessageTitle } from '@app/enums/board-message-title';

export interface BoardMessage {
    title: BoardMessageTitle;
    content?: BoardMessageContent | string;
    score?: number;
}
