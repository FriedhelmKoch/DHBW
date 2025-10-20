import { useState, useEffect } from "react";

export default function App() {
  const [emails, setEmails] = useState([]);
  const [mode, setMode] = useState("demo"); // demo | real | ai | ai-filter
  const [folder, setFolder] = useState("INBOX");
  const [folders] = useState([
    "Bewerbungen",
    "Entwürfe",
    "Gelöscht",
    "Gesendet",
    "INBOX",
    "OUTBOX",
  ]);
  const [query, setQuery] = useState("agile Projekte");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMails, setSelectedMails] = useState([]);
  const [aiReplies, setAiReplies] = useState([]);
  const [showAIConfirm, setShowAIConfirm] = useState(false);

  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      let url = `http://localhost:4000/emails/${mode}?folder=${folder}`;
      if ((mode === "demo" || mode === "ai-filter") && query) {
        url += `&query=${encodeURIComponent(query)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fehler ${res.status}`);
      const data = await res.json();
      setEmails(data);
      setSelectedMails([]);
      setAiReplies([]);
    } catch (err) {
      console.error("Fehler beim Laden der Mails:", err);
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (mail) => {
    setSelectedMails((prev) =>
      prev.includes(mail) ? prev.filter((m) => m !== mail) : [...prev, mail]
    );
  };

  const handleAIReplyClick = () => {
    if (selectedMails.length === 0) return alert("Keine Mails ausgewählt");
    setShowAIConfirm(true);
  };

  const sendAIReply = async () => {
    // Hier würde normalerweise ein Backend Call stattfinden
    const mockReplies = selectedMails.map((mail) => ({
      originalMail: mail,
      reply: `Dies ist eine vorgefertigte Antwort auf "${mail.subject}"`,
    }));
    setAiReplies(mockReplies);
    setShowAIConfirm(false);
  };

  useEffect(() => {
    fetchEmails();
  }, [mode, folder]);

  return (
    <div className="app-container">
      <h2 style={{ marginBottom: "12px" }}>🤖 AI-Email-Agent</h2>

      <div className="controls">
        <select value={folder} onChange={(e) => setFolder(e.target.value)}>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <div className="button-group">
          <button onClick={() => setMode("demo")}>Demo-Mail</button>
          <button onClick={() => setMode("real")}>Echte Mails</button>
          <button onClick={() => setMode("ai")}>AI-Zusammenfassung</button>
          <button onClick={() => setMode("ai-filter")}>AI-Filter starten</button>
        </div>

        {(mode === "demo" || mode === "ai-filter") && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Suchbegriff..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={fetchEmails}>🔍 Suche</button>
          </div>
        )}

        <button
          className="ai-reply-btn fancy"
          onClick={handleAIReplyClick}
          disabled={selectedMails.length === 0}
        >
          <span className="icon">🤖</span>
          <span>AI-Reply</span>
        </button>
      </div>

      {isLoading && <p>⏳ Mails werden geladen...</p>}

      {emails.map((mail, i) => (
        <div
          key={i}
          className={`email-card ${mail.match ? "highlight" : ""}`}
        >
          <input
            type="checkbox"
            checked={selectedMails.includes(mail)}
            onChange={() => toggleSelect(mail)}
          />
          <h3>{mail.subject}</h3>
          <p>
            <strong>Von:</strong> {mail.from}
          </p>
          <div
            className="email-body"
            dangerouslySetInnerHTML={{ __html: mail.html }}
          />
          {mail.summary && (
            <p className="ai-summary">
              <strong>AI:</strong> {mail.summary}{" "}
              {mail.tokens && (
                <>
                  — <em>{mail.tokens} Tokens (${mail.cost})</em>
                </>
              )}
            </p>
          )}
        </div>
      ))}

      {aiReplies.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>AI-Generierte Antworten:</h3>
          {aiReplies.map((r, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #4caf50",
                backgroundColor: "#e8f5e9",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p>
                <strong>Für Mail:</strong> {r.originalMail.subject}
              </p>
              <p>{r.reply}</p>
            </div>
          ))}
        </div>
      )}

      {showAIConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <p>
              Möchten Sie für die ausgewählten Mails eine AI-Antwort generieren?
            </p>
            <div className="modal-buttons">
              <button onClick={sendAIReply}>Ja</button>
              <button onClick={() => setShowAIConfirm(false)}>Nein</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
