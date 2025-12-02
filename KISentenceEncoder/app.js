// EMOTIONS DEFINITION - Erweitert für mehr Emotionen
const EMOTIONS = [
    {id: 'freude', name: 'Freude', emoji: '😄', color: '#4CAF50'},
    {id: 'liebe', name: 'Liebe/Zufriedenheit', emoji: '❤️', color: '#9c27b0'},
    {id: 'ueberraschung', name: 'Überraschung', emoji: '😲', color: '#ff9800'},
    {id: 'trauer', name: 'Trauer', emoji: '😢', color: '#2196F3'},
    {id: 'wut', name: 'Wut/Ärger', emoji: '😠', color: '#f44336'},
    {id: 'angst', name: 'Angst/Furcht', emoji: '😨', color: '#673ab7'},
    {id: 'neutral', name: 'Neutral', emoji: '😐', color: '#6c757d'}
];

// Textbeispiele für jede Emotion
const SAMPLE_TEXTS = [
    {
        id: 'freude',
        title: 'Freude',
        text: 'Das war die beste Nachricht, die ich seit langem gehört habe! Ich bin überglücklich!',
        emoji: '😄'
    },
    {
        id: 'liebe',
        title: 'Liebe & Zufriedenheit',
        text: 'Ich liebe dieses neue Buch! Es ist so beruhigend und ich fühle mich einfach wohl.',
        emoji: '❤️'
    },
    {
        id: 'ueberraschung',
        title: 'Überraschung',
        text: 'Unglaublich! Ich hätte nie erwartet, dass das passiert! Was für eine Wendung!',
        emoji: '😲'
    },
    {
        id: 'trauer',
        title: 'Trauer',
        text: 'Ich fühle mich heute wirklich leer. Alles scheint mir hoffnungslos und grau.',
        emoji: '😢'
    },
    {
        id: 'wut',
        title: 'Wut & Ärger',
        text: 'Das ist absolut inakzeptabel! Ich bin furchtbar wütend über diesen Fehler und die Frechheit!',
        emoji: '😠'
    },
    {
        id: 'angst',
        title: 'Angst & Furcht',
        text: 'Mir ist ganz kalt geworden. Was, wenn das wirklich schiefgeht? Ich habe große Angst davor.',
        emoji: '😨'
    },
    {
        id: 'neutral',
        title: 'Neutral',
        text: 'Der Himmel ist heute blau. Ich muss daran denken, später die Einkäufe zu erledigen.',
        emoji: '😐'
    }
];

let useModel; // Das Universal Sentence Encoder Modell
let classifierModel = {
    predict: function(embeddings) {
        const text = document.getElementById('text-input').value.toLowerCase();
        
        // **ERWEITERTE SIMULATION DER KLASSIFIKATION**
        let probabilities = [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.70]; // Standard: Neutral
        
        // Freude erkennen
        if (text.includes("toll") || text.includes("super") || text.includes("glücklich") || 
            text.includes("beste") || text.includes("überglücklich") || text.includes("fantastisch")) {
            probabilities = [0.85, 0.03, 0.02, 0.01, 0.02, 0.01, 0.06];
        } 
        // Liebe/Zufriedenheit erkennen
        else if (text.includes("liebe") || text.includes("beruhigend") || text.includes("wohl") || 
                 text.includes("zufrieden") || text.includes("schön")) {
            probabilities = [0.10, 0.80, 0.02, 0.01, 0.01, 0.01, 0.05];
        }
        // Überraschung erkennen
        else if (text.includes("unglaublich") || text.includes("erwartet") || text.includes("wendung") || 
                 text.includes("überraschung") || text.includes("plötzlich")) {
            probabilities = [0.05, 0.02, 0.83, 0.02, 0.03, 0.02, 0.03];
        }
        // Trauer erkennen
        else if (text.includes("traurig") || text.includes("leer") || text.includes("hoffnungslos") || 
                 text.includes("grau") || text.includes("deprimiert")) {
            probabilities = [0.01, 0.02, 0.02, 0.85, 0.03, 0.02, 0.05];
        }
        // Wut/Ärger erkennen
        else if (text.includes("wütend") || text.includes("inakzeptabel") || text.includes("fehler") || 
                 text.includes("frechheit") || text.includes("ärgerlich")) {
            probabilities = [0.01, 0.01, 0.02, 0.03, 0.86, 0.02, 0.05];
        }
        // Angst/Furcht erkennen
        else if (text.includes("angst") || text.includes("furcht") || text.includes("schiefgeht") || 
                 text.includes("kalt") || text.includes("sorge")) {
            probabilities = [0.01, 0.01, 0.03, 0.02, 0.02, 0.86, 0.05];
        }
        
        // Erzeuge einen TF.js Tensor aus den simulierten Wahrscheinlichkeiten
        return tf.tensor2d([probabilities]);
    }
};

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    loadModel();
    loadSampleTexts();
});

// 1. Lade das Universal Sentence Encoder Modell beim Start
async function loadModel() {
    const statusElement = document.getElementById('emotion-display');
    statusElement.innerHTML = '<div class="loading"></div> Modelle werden geladen...';
    
    try {
        // Lade den Universal Sentence Encoder
        useModel = await use.load();
        
        statusElement.textContent = 'Bereit zur Analyse.';
        console.log('Modelle geladen.');
    } catch (error) {
        console.error("Fehler beim Laden des Modells:", error);
        statusElement.textContent = 'Fehler beim Laden des Modells.';
    }
}

// 2. Lade Textbeispiele in die UI
function loadSampleTexts() {
    const container = document.getElementById('samples-container');
    
    SAMPLE_TEXTS.forEach(sample => {
        const sampleCard = document.createElement('div');
        sampleCard.className = `sample-card ${sample.id}`;
        sampleCard.innerHTML = `
            <div class="sample-emoji">${sample.emoji}</div>
            <div class="sample-title">${sample.title}</div>
            <div class="sample-text">${sample.text}</div>
        `;
        
        sampleCard.addEventListener('click', () => {
            document.getElementById('text-input').value = sample.text;
        });
        
        container.appendChild(sampleCard);
    });
}

// 3. Hauptfunktion zur Textanalyse
async function analyzeText() {
    const text = document.getElementById('text-input').value.trim();
    const outputElement = document.getElementById('emotion-display');
    const probabilityList = document.getElementById('probability-list');

    if (!text) {
        outputElement.textContent = 'Bitte geben Sie Text ein.';
        outputElement.className = 'emotion-text';
        probabilityList.innerHTML = '';
        return;
    }
    if (!useModel) {
        outputElement.textContent = 'Modelle sind noch nicht geladen.';
        outputElement.className = 'emotion-text';
        return;
    }

    outputElement.innerHTML = '<div class="loading"></div> Analysiere Text...';
    outputElement.className = 'emotion-text';
    probabilityList.innerHTML = '<li>Lade...</li>';

    try {
        // 2.1. Text in Embedding umwandeln
        const embeddings = await useModel.embed(text);
        
        // 2.2. Klassifikation
        const prediction = classifierModel.predict(embeddings);
        
        // 2.3. Wahrscheinlichkeiten extrahieren
        const probabilities = await prediction.data();
        const predictedEmotionIndex = prediction.argMax(1).dataSync()[0];
        const emotion = EMOTIONS[predictedEmotionIndex];
        
        // 2.4. Ergebnisse anzeigen
        outputElement.textContent = `${emotion.name} ${emotion.emoji}`;
        outputElement.className = `emotion-text emotion-${emotion.id}`;
        
        // Wahrscheinlichkeiten anzeigen
        displayProbabilities(probabilities);
        
        // 2.5. Aufräumen des Tensorspeichers
        tf.dispose([embeddings, prediction]);
    } catch (error) {
        console.error("Fehler bei der Analyse:", error);
        outputElement.textContent = 'Ein Fehler ist aufgetreten.';
        outputElement.className = 'emotion-text';
    }
}

// 4. Wahrscheinlichkeiten visualisieren
function displayProbabilities(probabilities) {
    const probabilityList = document.getElementById('probability-list');
    probabilityList.innerHTML = '';
    
    EMOTIONS.forEach((emotion, index) => {
        const probability = probabilities[index];
        const percentage = Math.round(probability * 100);
        
        const listItem = document.createElement('li');
        listItem.className = 'probability-item';
        listItem.innerHTML = `
            <span style="font-size: 0.9rem;">${emotion.emoji} ${emotion.name}</span>
            <span style="font-weight: 600;">${percentage}%</span>
            <div class="probability-bar">
                <div class="probability-fill" style="width: ${percentage}%; background-color: ${emotion.color};"></div>
            </div>
        `;
        
        probabilityList.appendChild(listItem);
    });
}

// 5. Textfeld leeren
function clearText() {
    document.getElementById('text-input').value = '';
    document.getElementById('emotion-display').textContent = 'Warten auf Eingabe...';
    document.getElementById('emotion-display').className = 'emotion-text';
    document.getElementById('probability-list').innerHTML = '';
}

// 6. Enter-Taste zum Analysieren verwenden
document.getElementById('text-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault();
        analyzeText();
    }
});
