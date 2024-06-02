const dotenv = require("dotenv");
const dateFns = require("date-fns");
const mongoose = require("mongoose");

const Reading = require("../models/readingModel");

dotenv.config({ path: "../config.env" });

// console.log(process.argv);

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {}).then(() => {
  console.log("Connected to database ✅");
});

function generateReading(date) {
  return {
    temperature: Math.round(Math.random() * 40),
    humidity: Math.round(Math.random() * 60),
    rainDrop: Math.round(Math.random() * 20),
    current: Math.round(Math.random() * 30),
    pressure: Math.round(Math.random() * 70),
    date,
    panel: "663cd19d63ade4be7cd8036e",
  };
}

async function addReadings() {
  for (let m = 0; m < 12; m++) {
    const month = dateFns.subMonths(Date.now(), m);

    month.setUTCDate(1);
    month.setUTCHours(0, 0, 0, 0);

    const days = dateFns.getDaysInMonth(month);

    const promises = [];

    for (let d = 0; d < days; d++) {
      const date = dateFns.addDays(month, d);
      if (dateFns.isAfter(date, Date.now())) {
        break;
      }

      for (let h = 0; h < 24; h += 3) {
        promises.push(
          Reading.create(generateReading(dateFns.addHours(date, h)))
        );
      }
    }

    console.log(m, "loops finished");
    await Promise.all(promises);
    console.log(m, "created");
  }
  console.log("done");
}

async function deleteReadings() {
  console.log("deleting");

  await Reading.deleteMany();
  console.log("deleted");
}

if (process.argv[2] === "import-readings") {
  addReadings();
}

if (process.argv[2] === "delete-readings") {
  deleteReadings();
}
