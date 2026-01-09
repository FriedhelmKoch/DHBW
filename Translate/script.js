// Translation Manager - Lädt Übersetzungen aus JSON-Dateien
class TranslationManager {
    constructor() {
        this.translations = {};
        this.currentLanguage = 'en';
        this.defaultLanguage = 'en';
        this.elementObserver = null;
        
        // IDs von Elementen, die beobachtet werden sollen
        this.translatableElements = new Set();
    }
    
    // Lädt eine Sprachdatei
    async loadLanguage(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Language file ${lang}.json not found`);
            }
            
            this.translations[lang] = await response.json();
            return this.translations[lang];
        } catch (error) {
            console.error(`Error loading language ${lang}:`, error);
            
            // Fallback: Default-Sprache laden
            if (lang !== this.defaultLanguage) {
                return await this.loadLanguage(this.defaultLanguage);
            }
            
            return {};
        }
    }
    
    // Wechselt die Sprache
    async switchLanguage(lang) {
        if (this.currentLanguage === lang) return;
        
        // Sprache laden (falls noch nicht geladen)
        if (!this.translations[lang]) {
            await this.loadLanguage(lang);
        }
        
        this.currentLanguage = lang;
        
        // Alle Elemente übersetzen
        this.translateAllElements();
        
        // Event auslösen
        this.onLanguageChanged(lang);
        
        // Sprache in localStorage speichern
        localStorage.setItem('preferred-language', lang);
        
        // Sprache im HTML-Tag setzen
        document.documentElement.lang = lang;
    }
    
    // Übersetzt alle Elemente mit IDs
    translateAllElements() {
        const t = this.translations[this.currentLanguage];
        if (!t) return;
        
        // Hilfsfunktion zur HTML-Sicherheitsprüfung
        const sanitizeHTML = (html) => {
            // Einfache Sicherheitsprüfung - entfernt gefährliche Inhalte
            return html
                // Entferne <script> Tags komplett
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                // Entferne on*-Event-Handler
                .replace(/on\w+\s*=\s*(["'])(.*?)\1/gi, '')
                .replace(/on\w+\s*=\s*([^"'\s>]*)/gi, '')
                // Entferne javascript: Links
                .replace(/javascript:\s*([^"'>]*)/gi, '#')
                // Entferne vbscript: Links
                .replace(/vbscript:\s*([^"'>]*)/gi, '#')
                // Entferne data: URLs (können gefährlich sein)
                .replace(/data:\s*([^"'>]*)/gi, '#')
                // Erlaube nur bestimmte Tags (optional, für mehr Sicherheit)
                // .replace(/<(?!\/?(b|strong|i|em|u|span|a|br|p|div|ul|ol|li|h[1-6]|mark|small|sub|sup)(\s|\/?>))/gi, '&lt;')
                ;
        };
        
        // Prüft, ob Text HTML-Tags enthält
        const containsHTML = (text) => {
            return /<\/?[a-z][\s\S]*>/i.test(text);
        };
        
        // Alle Elemente mit IDs finden, die in den Übersetzungen existieren
        Object.keys(t).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                const translation = t[key];
                
                // Sonderfall: Platzhalter in Inputs/Textareas (NIEMALS HTML erlauben!)
                if (element.placeholder !== undefined && t[`${key}-placeholder`]) {
                    element.placeholder = t[`${key}-placeholder`];
                }
                
                // Sonderfall: alt-Text für Bilder (NIEMALS HTML erlauben!)
                if (element.alt !== undefined && t[`${key}-alt`]) {
                    element.alt = t[`${key}-alt`];
                }
                
                // Sonderfall: title-Attribut (NIEMALS HTML erlauben!)
                if (element.title !== undefined && t[`${key}-title`]) {
                    element.title = t[`${key}-title`];
                }
                
                // Normale Textelemente - MIT HTML-Unterstützung
                if (translation && element.textContent !== undefined) {
                    // Entscheiden, ob wir HTML verwenden können
                    const tagName = element.tagName.toLowerCase();
                    
                    // Element-Typen, die NIEMALS HTML erlauben sollten
                    const noHtmlTags = ['input', 'textarea', 'button', 'option', 'select'];
                    const noHtmlElements = ['button', 'input', 'label']; // IDs die kein HTML erlauben
                    
                    // Prüfen, ob dieses Element HTML erlauben soll
                    let allowHTML = false;
                    
                    if (noHtmlTags.includes(tagName)) {
                        // Inputs, Textareas, Buttons etc. - KEIN HTML
                        allowHTML = false;
                    } else if (noHtmlElements.some(noHtmlId => key.includes(noHtmlId))) {
                        // Spezifische Elemente die kein HTML erlauben
                        allowHTML = false;
                    } else if (containsHTML(translation)) {
                        // Wenn der Text HTML-Tags enthält, erlaube HTML
                        allowHTML = true;
                    }
                    
                    if (allowHTML) {
                        // HTML mit Sicherheitsprüfung setzen
                        element.innerHTML = sanitizeHTML(translation);
                    } else {
                        // Normales textContent für Elemente ohne HTML
                        element.textContent = translation;
                    }
                }
                
                // Für Buttons und Inputs mit value (NIEMALS HTML erlauben!)
                if (element.value !== undefined && t[`${key}-value`]) {
                    element.value = t[`${key}-value`];
                } else if (element.value !== undefined && translation) {
                    element.value = translation;
                }
            }
        });
        
        // Attribute mit data-i18n übersetzen - MIT HTML-Unterstützung
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (t[key]) {
                const translation = t[key];
                
                // Prüfen, ob HTML erlaubt ist
                if (containsHTML(translation)) {
                    element.innerHTML = sanitizeHTML(translation);
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // NEU: data-i18n-html für explizite HTML-Übersetzungen
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            if (t[key]) {
                // IMMER als HTML behandeln (für explizite HTML-Übersetzungen)
                element.innerHTML = sanitizeHTML(t[key]);
            }
        });
        
        // Attribute mit data-i18n-placeholder (NIEMALS HTML!)
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (t[key]) {
                element.placeholder = t[key];
            }
        });
        
        // Attribute mit data-i18n-title (NIEMALS HTML!)
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (t[key]) {
                element.title = t[key];
            }
        });
        
        // NEU: data-i18n-html-title für HTML in title (selten benötigt)
        document.querySelectorAll('[data-i18n-html-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-html-title');
            if (t[key]) {
                // title-Attribute können kein HTML, also normal setzen
                element.title = t[key];
            }
        });
    }
    
    // Fügt neues übersetzbares Element hinzu
    addTranslatableElement(id) {
        this.translatableElements.add(id);
    }
    
    // Event-Handler für Sprachwechsel
    onLanguageChanged(lang) {
        console.log(`Language changed to: ${lang}`);
        
        // Event auslösen für andere Komponenten
        const event = new CustomEvent('languageChanged', {
            detail: { language: lang }
        });
        document.dispatchEvent(event);
    }
    
    // Initialisiert den Translation Manager
    async init() {
        // Gespeicherte Sprache laden oder Browser-Sprache erkennen
        const savedLang = localStorage.getItem('preferred-language');
        const browserLang = navigator.language.substring(0, 2);
        
        let lang = savedLang || browserLang || this.defaultLanguage;
        
        // Prüfen, ob Sprache verfügbar ist
        const availableLangs = ['en', 'de', 'fr', 'es'];
        if (!availableLangs.includes(lang)) {
            lang = this.defaultLanguage;
        }
        
        // Standard-Sprache laden
        await this.loadLanguage(this.defaultLanguage);
        
        // Gewählte Sprache laden und anwenden
        await this.switchLanguage(lang);
        
        // Observer für neue Elemente (optional)
        this.setupObserver();
        
        return lang;
    }
    
    // Setup Mutation Observer für dynamische Inhalte
    setupObserver() {
        this.elementObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Neue Nodes prüfen
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Wenn Element eine ID hat, die in Übersetzungen existiert
                            if (node.id && this.translations[this.currentLanguage]?.[node.id]) {
                                this.translateElement(node);
                            }
                            
                            // Auch in Children suchen
                            node.querySelectorAll('[id]').forEach(element => {
                                if (this.translations[this.currentLanguage]?.[element.id]) {
                                    this.translateElement(element);
                                }
                            });
                        }
                    });
                }
            });
        });
        
        // Observer starten
        this.elementObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Übersetzt ein einzelnes Element
    translateElement(element) {
        const t = this.translations[this.currentLanguage];
        if (!t) return;
        
        const key = element.id || element.getAttribute('data-i18n');
        if (key && t[key]) {
            element.textContent = t[key];
        }
    }
}

// UI Manager für Sprachauswahl
class UIManager {
    constructor(translationManager) {
        this.tm = translationManager;
        this.init();
    }
    
    init() {
        this.setupLanguageSwitcher();
        this.updateLanguageMenu();
        
        // Event-Listener für Sprachwechsel
        document.addEventListener('languageChanged', (e) => {
            this.updateLanguageMenu();
        });
    }
    
    setupLanguageSwitcher() {
        const toggle = document.getElementById('lang-toggle');
        const options = document.getElementById('language-options');
        
        if (!toggle || !options) return;
        
        // Toggle für Sprachmenü
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            options.classList.toggle('show');
        });
        
        // Event Listener für Sprachoptionen
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                e.preventDefault();
                const lang = e.currentTarget.dataset.lang;
                
                await this.tm.switchLanguage(lang);
                
                // Menü schließen
                options.classList.remove('show');
            });
        });
        
        // Menü schließen, wenn außerhalb geklickt wird
        document.addEventListener('click', (e) => {
            if (!options.contains(e.target) && !toggle.contains(e.target)) {
                options.classList.remove('show');
            }
        });
        
        // Menü mit ESC schließen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                options.classList.remove('show');
            }
        });
    }
    
    updateLanguageMenu() {
        const currentLang = this.tm.currentLanguage;
        
        // Aktiven Zustand im Menü aktualisieren
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.lang === currentLang) {
                option.classList.add('active');
            }
        });
        
        // Globus-Icon aktualisieren
        const flagEmojis = { en: '🇺🇸', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸' };
        const toggle = document.getElementById('lang-toggle');
        if (toggle) {
            toggle.innerHTML = flagEmojis[currentLang] || '🌐';
            toggle.title = this.tm.translations[currentLang]?.language || 'Language';
        }
    }
}

// Haupt-Initialisierung
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Translation Manager erstellen und initialisieren
        const translationManager = new TranslationManager();
        const initialLang = await translationManager.init();
        
        // UI Manager erstellen
        const uiManager = new UIManager(translationManager);
        
        // Globale Referenz (für Debugging)
        window.i18n = translationManager;
        
        console.log(`Website initialized with language: ${initialLang}`);
        
        // Beispiel: Dynamisches Hinzufügen von Inhalten
        setTimeout(() => {
            // Demo: Dynamisch hinzugefügtes Element
            const dynamicElement = document.createElement('p');
            dynamicElement.id = 'dynamic-text';
            dynamicElement.textContent = 'This text was added dynamically';
            document.querySelector('.demo-card').appendChild(dynamicElement);
            
            // Übersetzung für dynamisches Element hinzufügen
            Object.keys(translationManager.translations).forEach(lang => {
                if (translationManager.translations[lang]) {
                    translationManager.translations[lang]['dynamic-text'] = 
                        lang === 'en' ? 'This text was added dynamically' :
                        lang === 'de' ? 'Dieser Text wurde dynamisch hinzugefügt' :
                        lang === 'fr' ? 'Ce texte a été ajouté dynamiquement' :
                        'Este texto fue agregado dinámicamente';
                }
            });
            
            // Element übersetzen
            translationManager.translateElement(dynamicElement);
        }, 2000);
        
    } catch (error) {
        console.error('Failed to initialize translation system:', error);
    }
});
