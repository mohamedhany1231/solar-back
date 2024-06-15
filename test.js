const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const secret = process.env.SOLAR_PANEL_SECRET_KEY;
const saltRounds = 12;

bcrypt.hash(secret, saltRounds).then((data) => console.log(data));
