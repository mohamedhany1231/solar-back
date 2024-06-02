const nodeMailer = require("nodemailer");
const Mailgen = require("mailgen");
const Transport = require("nodemailer-brevo-transport");

const MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "solar support",
    link: "https://mailgen.js/",
  },
});

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.name = user.name.split(" ")[0];
  }

  newTransporter() {
    if (process.env.NODE_ENV === "production") {
      return nodeMailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });
    } else {
      return nodeMailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
          user: "mohamedhany61@gmail.com",
          pass: process.env.SMTP_KEY,
        },
      });
    }
  }

  async sendEmail(subject, intro, outro) {
    const email = {
      body: {
        name: this.name,
        intro,
        outro,
      },
    };
    const emailBody = MailGenerator.generate(email);
    const mailOptions = {
      from: "panelsupport@aaa.com",
      to: this.to,
      subject,
      html: emailBody,
    };
    await this.newTransporter().sendMail(mailOptions);
  }

  async sendResetPassword() {
    await this.sendEmail(
      "reset password",
      `here is your password rest url \n ${this.url}`,
      "if you didn't request password reset , just ignore this email"
    );
  }
}

module.exports = Email;
