import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { simpleParser } from 'mailparser';
import imaps from 'imap-simple';
import DOMPurify from 'isomorphic-dompurify';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Demo-Mails laden
const demoMails = JSON.parse(fs.readFileSync(path.join('./src', 'mock-mails.json'), 'utf8'));

// Hilfsfunktion für echte Mails
const purify = DOMPurify;

async function processMail(raw) {
  try {
    const parsed = await simpleParser(raw.body || raw);
    let from = parsed.from?.text || '(Unbekannt)';
    let subject = parsed.subject || '(Kein Betreff)';
    let html = parsed.html || parsed.textAsHtml || parsed.text || '(Kein Inhalt)';

    html = html.replace(/--Apple-Mail[^]*?--/g, '');
    html = html.replace(/=\r\n/g, '').replace(/=([0-9A-F]{2})/gi, (m, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );

    html = purify.sanitize(html);
    return { from, subject, html };
  } catch (err) {
    return { from: '(Fehler beim Parsen)', subject: '(Fehler beim Parsen)', html: '(Fehler beim Parsen der Mail-Inhalte)' };
  }
}

// --- IMAP Konfiguration für echte Mails ---
const imapConfig = {
  imap: {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASS,
    host: process.env.IMAP_HOST,
    port: parseInt(process.env.IMAP_PORT || '993'),
    tls: process.env.IMAP_TLS === 'true',
    authTimeout: 3000
  },
  onError: console.error
};

// --- Endpunkt Demo-Mails ---
app.get('/emails/demo', async (req, res) => {
  const query = req.query.query?.toLowerCase() || "";
  const mails = demoMails.map(mail => ({
    ...mail,
    match: query && (mail.subject.toLowerCase().includes(query) || mail.html.toLowerCase().includes(query))
  }));
  res.json(mails);
});

// --- Endpunkt echte Mails ---
app.get('/emails/real', async (req, res) => {
  const folder = req.query.folder || 'INBOX';
  try {
    const connection = await imaps.connect(imapConfig);
    await connection.openBox(folder);
    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: [''], struct: true };
    const messages = await connection.search(searchCriteria, fetchOptions);

    const mails = await Promise.all(messages.map(async m => {
      const raw = m.parts.find(p => p.which === '')?.body || '';
      return processMail({ body: raw });
    }));

    await connection.end();
    res.json(mails);
  } catch (err) {
    console.error('IMAP Fehler:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der E-Mails' });
  }
});

// --- Endpunkt AI-Zusammenfassung ---
app.get('/emails/ai', async (req, res) => {
  const folder = req.query.folder || 'INBOX';
  const query = req.query.query?.toLowerCase() || "";

  if (!process.env.OPENAI_API_KEY) {
    // Demo-Daten
    const mails = demoMails.map(mail => ({
      ...mail,
      match: query && (mail.subject.toLowerCase().includes(query) || mail.html.toLowerCase().includes(query))
    }));
    return res.json(mails);
  }

  try {
    const connection = await imaps.connect(imapConfig);
    await connection.openBox(folder);
    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: [''], struct: true };
    const messages = await connection.search(searchCriteria, fetchOptions);

    const mails = await Promise.all(messages.map(async m => {
      const raw = m.parts.find(p => p.which === '')?.body || '';
      const processed = await processMail({ body: raw });

      // Hier könntest du echte OpenAI-Zusammenfassung aufrufen
      processed.summary = 'Dies ist eine AI-Zusammenfassung.';
      processed.tokens = 50;
      processed.cost = 0.0004;

      return processed;
    }));

    await connection.end();
    res.json(mails);
  } catch (err) {
    console.error('AI-IMAP Fehler:', err);
    res.status(500).json({ error: 'Fehler bei AI-Zusammenfassung' });
  }
});

// --- Endpunkt AI-Filter ---
app.get('/emails/ai-filter', async (req, res) => {
  const folder = req.query.folder || 'INBOX';
  const query = req.query.query?.toLowerCase() || "";

  if (!process.env.OPENAI_API_KEY) {
    const mails = demoMails.map(mail => ({
      ...mail,
      match: query && (mail.subject.toLowerCase().includes(query) || mail.html.toLowerCase().includes(query))
    }));
    return res.json(mails);
  }

  try {
    const connection = await imaps.connect(imapConfig);
    await connection.openBox(folder);
    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: [''], struct: true };
    const messages = await connection.search(searchCriteria, fetchOptions);

    const mails = await Promise.all(messages.map(async m => {
      const raw = m.parts.find(p => p.which === '')?.body || '';
      const processed = await processMail({ body: raw });

      processed.match = query && (processed.subject.toLowerCase().includes(query) || processed.html.toLowerCase().includes(query));
      processed.summary = 'Demo AI-Filter (echte Mail)';
      processed.tokens = 50;
      processed.cost = 0.0004;

      return processed;
    }));

    await connection.end();
    res.json(mails);
  } catch (err) {
    console.error('AI-Filter Fehler:', err);
    res.status(500).json({ error: 'Fehler bei AI-Filter' });
  }
});

// --- Endpunkt AI-Reply ---
app.post('/emails/ai-reply', async (req, res) => {
  const mails = req.body.mails || [];
  const replies = mails.map(mail => ({
    originalMail: mail,
    reply: `Hallo ${mail.from.split('<')[0].trim()},\n\nVielen Dank für Ihre Nachricht zu "${mail.subject}". Wir melden uns zeitnah zurück.\n\nBeste Grüße\nIhr Team`
  }));
  res.json(replies);
});

app.listen(PORT, () => console.log(`Backend läuft auf Port ${PORT}`));
