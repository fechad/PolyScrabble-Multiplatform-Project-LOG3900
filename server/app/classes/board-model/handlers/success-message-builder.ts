import { BoardMessageTitle } from '@app/enums/board-message-title';
import { BoardMessage } from '@app/interfaces/board-message';
export class SuccessMessageBuilder {
    static elaborateSuccessMessage(letters: string[], row: string, column: number, direction?: string, points?: number): BoardMessage {
        const answer: BoardMessage = {
            title: BoardMessageTitle.SuccessfulPlacement,
            content: ` a effectué le placement suivant: \n
                Nouvelles lettres: ${letters} \n
                Depuis: ${row.toUpperCase()}${column} \n
                Direction: ${direction?.toUpperCase()} \n
                Nouveaux points: ${points}`,
        };
        return answer;
    }
}
