const mongoose = require("mongoose");
const bycrpt = require("bcrypt");
const crypto = require("crypto");

const settingsSchema = new mongoose.Schema({
  environmental: {
    type: String,
    Enum: ["low", "mid", "high"],
    required: true,
    default: "low",
  },
  performance: {
    type: String,
    Enum: ["low", "mid", "high"],
    required: true,
    default: "mid",
  },
  component: {
    type: String,
    Enum: ["low", "mid", "high"],
    required: true,
    default: "high",
  },
  operational: {
    type: String,
    Enum: ["low", "mid", "high"],
    required: true,
    default: "high",
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: "string",
    required: true,
    minLength: 3,
    maxLength: 20,
  },
  email: {
    type: "string",
    required: true,
    unique: [true, "user with this email already exist"],
  },
  password: {
    type: "string",
    required: true,
    minLength: 8,
    maxLength: 20,
    select: false,
  },
  confirmPassword: {
    type: "string",
    required: true,
    validate: {
      validator: function (value) {
        return value === this.password;
      },
    },
  },
  role: { type: "string", enum: ["admin", "user"], default: "user" },
  createdAt: { type: Date, default: Date.now() },
  photo: String,

  passwordResetToken: { type: String, select: false },
  passwordResetExpires: Date,

  panels: [{ type: mongoose.Schema.ObjectId, ref: "Panel" }],
  settings: { type: settingsSchema, required: true, default: {} },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bycrpt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.password = undefined;
  next();
});

userSchema.methods.correctPassword = async function (password, candidate) {
  return await bycrpt.compare(candidate, password);
};

userSchema.methods.passwordChangeAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    return this.passwordChangedAt.getTime() / 1000 > JWTTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // console.log({ token, pwResetToken: this.passwordResetToken });

  this.passwordResetExpires = new Date().getTime() + 10 * 60 * 1000;

  return token;
};

userSchema.methods.addPanel = function (panelId) {
  if (this.panels.includes(panelId)) return;
  this.panels.push(panelId);
};
userSchema.methods.removePanel = function (panelId) {
  if (!this.panels.includes(panelId)) return;
  this.panels.pull(panelId);
};

const model = mongoose.model("User", userSchema);

module.exports = model;
