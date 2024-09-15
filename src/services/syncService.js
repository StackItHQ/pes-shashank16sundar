const databaseService = require("./dbService");
const sheetsService = require("./gsheetsService");

class SyncService {
  async syncSheetsToDb() {
    const sheetRows = await sheetsService.getAllRows();
    const dbRecords = await databaseService.getAllRecords();

    for (const sheetRow of sheetRows) {
      const record = {
        id: sheetRow._rawData[0],
        name: sheetRow._rawData[1],
        age: sheetRow._rawData[2],
        email: sheetRow._rawData[3],
      };

      const existingRecord = dbRecords.find(
        (record) => record.id === record.id
      );
      if (existingRecord) {
        await databaseService.updateRecord(record.id, record);
      } else {
        await databaseService.insertRecord(record);
      }
    }

    for (const dbRecord of dbRecords) {
      if (!sheetRows.find((row) => row._rawData[0] === dbRecord.id)) {
        await databaseService.deleteRecord(dbRecord.id);
      }
    }
  }

  async syncDbToSheets() {
    const dbRecords = await databaseService.getAllRecords();
    const sheetRows = await sheetsService.getAllRows();

    for (const dbRecord of dbRecords) {
      const existingRow = sheetRows.find((row) => {
        if (row._rawData[0] === dbRecord.id) {
          return row._rawData[0];
        } else {
          return 0;
        }
      });
      if (existingRow) {
        await sheetsService.updateRow(sheetRows.indexOf(existingRow), dbRecord);
      } else {
        // Add new row
        await sheetsService.addRow(dbRecord);
      }
    }

    for (const sheetRow of sheetRows) {
      if (!dbRecords.find((record) => record.id === sheetRow.id)) {
        await sheetsService.deleteRow(sheetRows.indexOf(sheetRow));
      }
    }
  }

  async sync() {
    const dbLastModified = await databaseService.getLastModifiedTime();
    const sheetsLastModified = await sheetsService.getLastModifiedTime();

    console.log("db last time: " + dbLastModified);
    console.log("sheets last time: " + sheetsLastModified);

    if (dbLastModified > sheetsLastModified) {
      await this.syncDbToSheets();
    } else if (sheetsLastModified > dbLastModified) {
      await this.syncSheetsToDb();
    }
  }
}

module.exports = new SyncService();
