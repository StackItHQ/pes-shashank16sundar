const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const { google } = require("googleapis");

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
    return await this.sheet.getRows();
  }

  async addRow(data) {
    await this.init();
    return await this.sheet.addRow(data);
  }

  async updateRow(rowIndex, data) {
    await this.init();
    const rows = await this.sheet.getRows();
    const row = rows[rowIndex];
    Object.keys(data).forEach((key) => {
      row[key] = data[key];
    });
    await row.save();
    return row;
  }

  async deleteRow(rowIndex) {
    await this.init();
    const rows = await this.sheet.getRows();
    await rows[rowIndex].delete();
  }

  async getLastModifiedTime() {
    await this.init();
    const rows = await this.sheet.getRows();

    // console.log(`Total rows: ${rows.length}`);
    // console.log("First row data:", rows[0]._rawData);
    // console.log("First row id:", rows[0]._rawData[0]);

    let maxId = 0;
    for (const row of rows) {
      // console.log(`Processing row: ${row._rowNumber}`);
      // console.log("Row data:", row._rawData);
      // console.log("Row id:", row._rawData[0]);

      const id = parseInt(row._rawData[0], 10);
      // console.log(`Parsed id: ${id}`);

      if (!isNaN(id) && id > maxId) {
        maxId = id;
        // console.log(`New max id: ${maxId}`);
      }
    }

    console.log(`Final max ID from Google Sheets: ${maxId}`);
    return maxId;
  }
}

module.exports = new SheetsService();
