import dotenv from 'dotenv';
import imaps from 'imap-simple';
dotenv.config();

const config = {
  imap: {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASS,
    host: process.env.IMAP_HOST,
    port: parseInt(process.env.IMAP_PORT, 10),
    tls: process.env.IMAP_TLS === 'true'
  }
};

async function test() {
  const connection = await imaps.connect(config);
  await connection.openBox('INBOX');
  const mails = await connection.search(['ALL'], { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT'] });
  console.log('Mails gefunden:', mails.length);
  await connection.end();
}

test();
