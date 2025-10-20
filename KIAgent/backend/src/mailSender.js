import nodemailer from "nodemailer";
import fs from "fs";

export async function sendSummaryEmail(smtpConfig, receiver) {
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: true,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  await transporter.sendMail({
    from: smtpConfig.user,
    to: receiver,
    subject: "Tägliche E-Mail-Zusammenfassung",
    text: "Anbei die Analyse der heutigen ungelesenen E-Mails.",
    attachments: [
      {
        filename: "email_summary.csv",
        content: fs.createReadStream("email_summary.csv"),
      },
    ],
  });

  console.log("Zusammenfassung wurde per E-Mail verschickt ✅");
}
