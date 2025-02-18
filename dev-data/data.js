const dotenv = require("dotenv");
const dateFns = require("date-fns");
const mongoose = require("mongoose");

const Reading = require("../models/readingModel");

const panels = ["663cd19d63ade4be7cd8036e", "663cd22b63ade4be7cd80371"];
dotenv.config({ path: "../config.env" });

// console.log(process.argv);

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {}).then(() => {
  console.log("Connected to database ✅");
});

function generateReading(date, panelId) {
  return {
    temperature: Math.round(Math.random() * 40),
    intensity: Math.round(Math.random() * 60),
    color: Math.round(Math.random() * 20),
    current: Math.round(Math.random() * 30),
    power: Math.round(Math.random() * 30),
    pressure: Math.round(Math.random() * 70),
    humidity: Math.round(Math.random() * 70),
    date,
    panel: panelId,
  };
}

const startDate = dateFns.addMonths(Date.now(), 1);

async function addReadings() {
  const promises = [];
  panels.forEach((panel) => {
    for (let m = 0; m < 12; m++) {
      const month = dateFns.subMonths(startDate, m);

      month.setUTCDate(1);
      month.setUTCHours(0, 0, 0, 0);

      const days = dateFns.getDaysInMonth(month);

      for (let d = 0; d < days; d++) {
        const date = dateFns.addDays(month, d);
        // if (dateFns.isAfter(date, Date.now())) {
        //   break;
        // }

        for (let h = 0; h < 24; h += 3) {
          promises.push(
            Reading.create(generateReading(dateFns.addHours(date, h), panel))
          );
        }
      }
      console.log(m, "loops finished");
    }
  });

  console.log("creating data");
  await Promise.all(promises);
  console.log("done");
}

async function deleteReadings() {
  console.log("deleting");

  const promises = [];
  panels.forEach((panelId) => {
    promises.push(Reading.deleteMany({ panel: panelId }));
  });
  await Promise.all(promises);

  console.log("deleted");
}

if (process.argv[2] === "import-readings") {
  addReadings();
}

if (process.argv[2] === "delete-readings") {
  deleteReadings();
}
