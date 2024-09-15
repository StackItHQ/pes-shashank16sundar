const express = require("express");
const syncService = require("./services/syncService");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/sync", async (req, res) => {
  try {
    await syncService.sync();
    res.status(200).json({ message: "Sync completed successfully" });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Sync failed", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

setInterval(async () => {
  try {
    await syncService.sync();
    console.log("Periodic sync completed");
  } catch (error) {
    console.error("Periodic sync error:", error);
  }
}, 3 * 60 * 100);
