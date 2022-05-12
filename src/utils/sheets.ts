import { google } from 'googleapis';
import path from 'path';
import internal from 'stream';
import { project_id } from '../key.json';

export interface ILeaderBoardData {
    messageId: string,
    tableData: any
}

export const leaderbaordSheetId = "1GkmFTdZYO44aOdjLFfbLGHiUKsfO2ETjKlZ1m5eNX64";
//1cnxxW3U0nWjLX7OyC-14l4H0_YPWsQjdWLgFI97a7L9KSCcFnI-mD6gFkVJGm0

const sheets = google.sheets('v4');
const drive = google.drive('v3')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];
const projectId = project_id;
const keyFilename = path.join(__dirname, '../key.json');
export async function getAuthToken() {
    const auth = new google.auth.GoogleAuth({
        scopes: SCOPES,
        projectId: projectId,
        keyFile: keyFilename
    });
    const authToken = await auth.getClient();
    return authToken;
}

export async function getSpreadSheet({ spreadsheetId, auth }) {
    const res = await sheets.spreadsheets.get({
        spreadsheetId,
        auth,
    });
    return res;
}

export async function getSpreadSheetValues({ spreadsheetId, auth, sheetNameOrRange }): Promise<ISpreadSheetValues> {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        auth,
        range: sheetNameOrRange
    });
    return res.data;
}

export interface ISheetData {
    sheetName: string,
    sheetId: number,
    user?: string
}

export interface ISpreadSheetValues {
    range?: string,
    majorDimension?: string,
    values?: string[][]
}
export function mapValuesFromValues(rows: ISpreadSheetValues) {
    const messageData: IMessageData = {
        MessageId: rows.values[1][0],
        Title: rows.values[1][1],
        data: rows.values.map(x => { return x.join(' ') })
    }
    return messageData;
}

export interface IMessageData {
    MessageId: string,
    Title?: string,
    data?: string[]
}