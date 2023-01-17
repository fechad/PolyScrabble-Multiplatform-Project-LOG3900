import { BoardMessage } from '@app/classes/board-model/board-message';
import { BoardMessageTitle } from '@app/enums/board-message-title';
export class SuccessMessageBuilder {
    static elaborateSuccessMessage(letters: string[], row: string, column: number, direction?: string): BoardMessage {
        const answer: BoardMessage = {
            title: BoardMessageTitle.SuccessfulPlacement,
            content: ` a effectué le placement suivant: \n
                Nouvelles lettres: ${letters} \n 
                Depuis: ${row.toUpperCase()}${column} \n 
                Direction: ${direction?.toUpperCase()} \n
                Nouveaux points: `,
        };
        return answer;
    }
}
