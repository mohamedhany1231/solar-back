const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });

const app = require("./app");
const port = process.env.PORT || 3000;

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {})
  .then(() => {
    console.log("Connected to database ✅");
  })
  .catch((err) => {
    console.error("Error connecting to database");
    console.error(err.message);
  });

app.listen(port, () => {
  console.log(`started listening on port ${port}`);
});
