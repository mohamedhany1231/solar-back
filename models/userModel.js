const mongoose = require("mongoose");
const bycrpt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: "string",
    required: true,
    minLength: 3,
    maxLength: 20,
  },
  email: { type: "string", required: true, unique: true },
  password: {
    type: "string",
    required: true,
    minLength: 8,
    maxLength: 20,
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
  createdAt: { type: Date, default: Date.now() },

  passwordResetToken: String,
  passwordResetExpires: Date,

  panels: [{ type: mongoose.Schema.ObjectId, ref: "Panel" }],
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
