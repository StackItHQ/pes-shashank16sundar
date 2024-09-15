const pool = require("../configs/database");

class DatabaseService {
  async getAllRecords() {
    const [rows] = await pool.query("SELECT * FROM table2x");
    return rows;
  }

  async insertRecord(data) {
    console.log(data);

    const { id, name, age, email } = data;
    const [result] = await pool.query(
      "INSERT INTO table2x (id, name, age, email) VALUES (?, ?, ?, ?)",
      [id, name, age, email]
    );
    return result;
  }

  async updateRecord(id, data) {
    const { name, age, email } = data;
    const [result] = await pool.query(
      "UPDATE table2x SET name = ?, age = ?, email = ? WHERE id = ?",
      [name, age, email, id]
    );
    return result;
  }

  async deleteRecord(id) {
    const [result] = await pool.query("DELETE FROM table2x WHERE id = ?", [id]);
    return result;
  }

  async getLastModifiedTime() {
    const [result] = await pool.query(
      "SELECT MAX(id) as last_modified FROM table2x"
    );
    return result[0].last_modified;
  }
}

module.exports = new DatabaseService();
