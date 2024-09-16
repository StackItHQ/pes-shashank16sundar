const pool = require("../configs/database");
const syncService = require("./syncService");

class DatabaseService {
  async getAllRecords() {
    const [rows] = await pool.query("SELECT * FROM table2x");
    return rows;
  }

  async insertRecord(data) {
    const result = await pool.query(
      "INSERT INTO table2x (id, name, age, email) VALUES (?, ?, ?, ?)",
      [data.id, data.name, data.age, data.email]
    );
    // await syncService.syncDbToSheets();
    return result;
  }

  async updateRecord(id, data) {
    const { name, age, email } = data;
    const [result] = await pool.query(
      "UPDATE table2x SET name = ?, age = ?, email = ? WHERE id = ?",
      [name, age, email, id]
    );
    // await syncService.syncDbToSheets();
    return result;
  }

  async deleteRecord(id) {
    const [result] = await pool.query("DELETE FROM table2x WHERE id = ?", [id]);
    // await syncService.syncDbToSheets();
    return result;
  }

  async getLastModifiedTime() {
    const [result] = await pool.query(
      "SELECT MAX(last_modified) as last_modified FROM table2x"
    );
    const utcDate = new Date(result[0].last_modified);

    // // Add 5 hours and 30 minutes (in milliseconds) to the UTC timestamp
    // const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours and 30 minutes in milliseconds
    // const istDate = new Date(utcDate.getTime() + istOffset);

    return utcDate;
  }
}

module.exports = new DatabaseService();
