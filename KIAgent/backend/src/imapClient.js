import Imap from "imap-simple";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";

dotenv.config();

export async function fetchEmails() {
  const config = {
    imap: {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASS,
      host: process.env.IMAP_HOST || "imap.ionos.de",
      port: process.env.IMAP_PORT || 993,
      tls: true
    }
  };

  const connection = await Imap.connect(config);
  await connection.openBox("INBOX");
  const searchCriteria = ["UNSEEN"];
  const fetchOptions = { bodies: ["HEADER", "TEXT"], markSeen: true };
  const results = await connection.search(searchCriteria, fetchOptions);
  const emails = [];

  for (const res of results) {
    const parsed = await simpleParser(res.parts[0].body);
    emails.push({
      subject: parsed.subject,
      from: parsed.from.text,
      date: parsed.date,
      text: parsed.text
    });
  }

  connection.end();
  return emails;
}
