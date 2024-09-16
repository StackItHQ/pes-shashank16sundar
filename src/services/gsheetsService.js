const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const { google } = require("googleapis");
const syncService = require("./syncService");

require("dotenv").config();

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ],
});

const doc = new GoogleSpreadsheet(
  process.env.GOOGLE_SHEETS_DOCUMENT_ID,
  serviceAccountAuth
);

class SheetsService {
  constructor() {}

  async init() {
    await doc.loadInfo();
    this.sheet = doc.sheetsByIndex[0];
  }

  async getAllRows() {
    await this.init();
    const rows = await this.sheet.getRows();
    return rows.map((row) => ({
      id: row._rawData[0],
      name: row._rawData[1],
      age: row._rawData[2],
      email: row._rawData[3],
      last_modified: new Date(row._rawData[4]).getTime(),
    }));
  }

  async addRow(data) {
    await this.init();
    const rowData = {
      id: data.id,
      name: data.name,
      age: data.age,
      email: data.email,
      last_modified: data.last_modified,
    };
    await this.sheet.addRow(rowData);
    // syncService.syncSheetsToDb();
    return;
  }

  async updateRow(rowIndex, data) {
    await this.init();
    const rows = await this.sheet.getRows();
    const row = rows[rowIndex];

    row["id"] = data.id;
    row["name"] = data.name;
    row["age"] = data.age;
    row["email"] = data.email;
    row["last_modified"] = data.last_modified;

    await row.save();
    // syncService.syncSheetsToDb();
    return row;
  }

  async deleteRow(rowIndex) {
    await this.init();
    const rows = await this.sheet.getRows();
    // syncService.syncSheetsToDb();
    await rows[rowIndex].delete();
  }

  async getLastModifiedTime() {
    await this.init();
    const rows = await this.sheet.getRows();

    let maxTimestamp = 0;
    for (const row of rows) {
      const dateStr = row._rawData[4];
      const timestamp = new Date(dateStr).getTime();

      if (!isNaN(timestamp) && timestamp > maxTimestamp) {
        maxTimestamp = timestamp;
      }
    }

    console.log(`Final max timestamp from Google Sheets: ${maxTimestamp}`);
    return maxTimestamp;
  }

  getFormattedTimestamp() {
    // const date = new Date();
    // return Utilities.formatDate(
    //   date,
    //   Session.getScriptTimeZone(),
    //   "yyyy-MM-dd HH:mm:ss"
    // );
    const date = new Date();
    return date.toISOString();
  }
}

module.exports = new SheetsService();
