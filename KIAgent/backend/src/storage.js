import fs from "fs";
const file = "./backend/data/emails.json";

export function saveEmails(emails) {
  fs.mkdirSync("./backend/data", { recursive: true });
  fs.writeFileSync(file, JSON.stringify(emails, null, 2));
}

export function loadEmails() {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}
