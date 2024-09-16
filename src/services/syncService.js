const databaseService = require("./dbService");
const sheetsService = require("./gsheetsService");

class SyncService {
  async syncSheetsToDb() {
    const sheetRows = await sheetsService.getAllRows();
    const dbRecords = await databaseService.getAllRecords();

    console.log(Array.isArray(dbRecords));
    console.log(dbRecords);

    for (const sheetRow of sheetRows) {
      sheetRow.id = Number(sheetRow.id);
      sheetRow.age = Number(sheetRow.age);
      console.log("Sheet Row:", sheetRow);

      const existingRecord = dbRecords.find(
        (record) => record.id === sheetRow.id
      );

      console.log("Existing record : ", existingRecord);

      if (existingRecord) {
        if (
          new Date(sheetRow.last_modified) >
          new Date(existingRecord.last_modified)
        ) {
          await databaseService.updateRecord(sheetRow.id, sheetRow);
        } else if (
          new Date(existingRecord.last_modified) >
          new Date(sheetRow.last_modified)
        ) {
          // Update the Sheet with the latest data from the database
          await sheetsService.updateRow(
            sheetRows.indexOf(sheetRow),
            existingRecord
          );
        }
      } else {
        console.log("Inserting new row");
        await databaseService.insertRecord(sheetRow);
      }
    }

    for (const dbRecord of dbRecords) {
      if (!sheetRows.find((row) => Number(row.id) === dbRecord.id)) {
        await databaseService.deleteRecord(dbRecord.id);
      }
    }
  }

  async syncDbToSheets() {
    const dbRecords = await databaseService.getAllRecords();
    const sheetRows = await sheetsService.getAllRows();

    for (const dbRecord of dbRecords) {
      const existingRow = sheetRows.find(
        (row) => Number(row.id) === dbRecord.id
      );

      console.log("db ", dbRecord.last_modified);
      console.log("sheets : ", existingRow.last_modified);

      if (existingRow) {
        if (
          new Date(dbRecord.last_modified) > new Date(existingRow.last_modified)
        ) {
          await sheetsService.updateRow(
            sheetRows.indexOf(existingRow),
            dbRecord
          );
        } else if (
          new Date(dbRecord.last_modified) < new Date(existingRow.last_modified)
        ) {
          existingRow.id = Number(existingRow.id);
          existingRow.age = Number(existingRow.age);
          databaseService.updateRecord(dbRecord.id, existingRow);
        } else {
          await sheetsService.addRow(dbRecord);
        }
      }
    }

    // for (const sheetRow of sheetRows) {
    //   if (!dbRecords.find((record) => record.id === sheetRow.id)) {
    //     await sheetsService.deleteRow(sheetRows.indexOf(sheetRow));
    //   }
    // }
  }

  async sync() {
    const dbLastModified = await databaseService.getLastModifiedTime();
    const sheetsLastModified = await sheetsService.getLastModifiedTime();

    console.log("db last time: " + dbLastModified);
    console.log("sheets last time: " + sheetsLastModified);

    if (dbLastModified > sheetsLastModified) {
      console.log("Syncing from db to sheets");

      await this.syncDbToSheets();
    } else if (sheetsLastModified > dbLastModified) {
      console.log("Syncing from sheets to db");
      await this.syncSheetsToDb();
    }
  }
}

module.exports = new SyncService();
