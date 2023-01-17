import { Data } from '@app/interfaces/datas';

export interface CommandResult {
    message?: string;
    messageToSender?: string;
    messageToOthers?: string;
    commandData?: Data;
    commandType: string;
    resultingScore?: number;
}
