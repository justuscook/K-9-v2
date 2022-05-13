import { google } from 'googleapis';
import path from 'path';
import internal from 'stream';
import { project_id } from '../key.json';

export const leaderbaordSheetId = "1GkmFTdZYO44aOdjLFfbLGHiUKsfO2ETjKlZ1m5eNX64";

//Google sheets api version settings
const sheets = google.sheets('v4');
const drive = google.drive('v3')

//Scopes needed to access sheets, used in getAuthToken()
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];
//data needed from key.json
const projectId = project_id;
const keyFilename = path.join(__dirname, '../key.json');

/** 
 * Bot service account auth
 * @returns Google auth token for api requests
 */
export async function getAuthToken() {
    const auth = new google.auth.GoogleAuth({
        scopes: SCOPES,
        projectId: projectId,
        keyFile: keyFilename
    });
    const authToken = await auth.getClient();
    return authToken;
}

/**
 * 
 * @param spreadsheetId The google sheet id from the URL
 * @param auth The auth info for the bot service account, obtained with getAuthToken()
 * @returns Info from a google sheet, would need to reference the sheets api docs to see exactly what
 */
export async function getSpreadSheet({ spreadsheetId, auth }) {
    const res = await sheets.spreadsheets.get({
        spreadsheetId,
        auth,
    });
    return res;
}
/**
 * Get values from a google sheet
 * @param speeadsheetId The google sheet id from the URL
 * @param auth The auth info for the bot service account, obtained with getAuthToken()
 * @param sheetNameOrRange Sheet name or range to get values for
 * @returns Spreadsheet values in the given range or sheet name
 */
export async function getSpreadSheetValues({ spreadsheetId, auth, sheetNameOrRange }): Promise<ISpreadSheetValues> {
    //Google sheets api request for values
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        auth,
        range: sheetNameOrRange
    });
    return res.data;
}

/**
 * @param sheetName Sheet name
 * @param sheetId Sheet ID
 * @param user we might not need, but I used on another project
 */
export interface ISheetData {
    sheetName: string,
    sheetId: number,
    user?: string
}

/**
 * Data format returned from sheets api 
 * @param range Range of rows and cells sent in api response
 * @param majorDimension What makes up the array returned by api, it will be ROWS or COlUMNS, either array of rows or columns
 * @param values The array of data
 */
export interface ISpreadSheetValues {
    range?: string,
    majorDimension?: string,
    values?: string[][]
}

/** 
 * Might need tweaks for other leaderboard, but currently extracts only the data from the spreadsheet return
 * @param rows 
 * @returns 
 */
export function mapValuesFromValues(rows: ISpreadSheetValues) {
    const messageData: IMessageData = {
        MessageId: rows.values[1][0],
        Title: rows.values[1][1],
        data: rows.values.map(x => { return x.join(' ') })
    }
    messageData.data = messageData.data.slice(3)
    return messageData;
}

/**
 * Info for discord message
 * @param MessageId message Id
 * @param Title Title of leaderboard, currently doesnt update in discord, but for reference in google sheets
 * @param data Data to be displayed in the message
 */
export interface IMessageData {
    MessageId: string,
    Title?: string,
    data?: string[]
}