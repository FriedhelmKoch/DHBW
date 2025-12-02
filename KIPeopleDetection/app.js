class PersonCounter {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.currentImageData = null;
        this.currentAnalysis = null;
        this.storageKey = 'personCounterHistory';
        this.maxStorageItems = 50; // Maximale Anzahl gespeicherter Bilder
        this.selectedImageId = null;
        
        // DOM Elements
        this.elements = {
            fileInput: document.getElementById('imageUpload'),
            inputImage: document.getElementById('inputImage'),
            canvas: document.getElementById('canvas'),
            uploadArea: document.getElementById('uploadArea'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            countDisplay: document.getElementById('count'),
            modelStatus: document.getElementById('modelStatus'),
            storageCount: document.getElementById('storageCount'),
            imageContainer: document.getElementById('imageContainer'),
            imagePlaceholder: document.getElementById('imagePlaceholder'),
            imageInfo: document.getElementById('imageInfo'),
            uploadProgress: document.getElementById('uploadProgress'),
            saveBtn: document.getElementById('saveBtn'),
            clearBtn: document.getElementById('clearBtn'),
            historyGrid: document.getElementById('historyGrid'),
            historyEmpty: document.getElementById('historyEmpty'),
            sortBy: document.getElementById('sortBy'),
            filterCount: document.getElementById('filterCount'),
            storageUsage: document.getElementById('storageUsage'),
            manageStorage: document.getElementById('manageStorage'),
            imageModal: document.getElementById('imageModal'),
            modalClose: document.getElementById('modalClose'),
            modalCanvas: document.getElementById('modalCanvas'),
            modalCount: document.getElementById('modalCount'),
            modalDate: document.getElementById('modalDate'),
            modalSize: document.getElementById('modalSize'),
            modalDelete: document.getElementById('modalDelete'),
            modalAnalyze: document.getElementById('modalAnalyze')
        };
        
        this.ctx = this.elements.canvas.getContext('2d');
        this.modalCtx = this.elements.modalCanvas.getContext('2d');
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.loadHistory();
        await this.loadModel();
        this.updateStorageInfo();
    }
    
    setupEventListeners() {
        // File input
        this.elements.fileInput.addEventListener('change', (event) => {
            this.handleFileSelect(event);
        });
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Save button
        this.elements.saveBtn.addEventListener('click', () => {
            this.saveCurrentImage();
        });
        
        // Clear button
        this.elements.clearBtn.addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Filter and sort
        this.elements.sortBy.addEventListener('change', () => {
            this.loadHistory();
        });
        
        this.elements.filterCount.addEventListener('change', () => {
            this.loadHistory();
        });
        
        // Storage management
        this.elements.manageStorage.addEventListener('click', () => {
            this.manageStorage();
        });
        
        // Modal
        this.elements.modalClose.addEventListener('click', () => {
            this.closeModal();
        });
        
        this.elements.modalDelete.addEventListener('click', () => {
            this.deleteSelectedImage();
        });
        
        this.elements.modalAnalyze.addEventListener('click', () => {
            this.reanalyzeSelectedImage();
        });
        
        // Close modal on outside click
        this.elements.imageModal.addEventListener('click', (event) => {
            if (event.target === this.elements.imageModal) {
                this.closeModal();
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    setupDragAndDrop() {
        this.elements.uploadArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            this.elements.uploadArea.style.background = 'rgba(67, 97, 238, 0.15)';
            this.elements.uploadArea.style.borderColor = 'var(--secondary-color)';
        });
        
        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.style.background = 'rgba(67, 97, 238, 0.05)';
            this.elements.uploadArea.style.borderColor = 'var(--primary-color)';
        });
        
        this.elements.uploadArea.addEventListener('drop', (event) => {
            event.preventDefault();
            this.elements.uploadArea.style.background = 'rgba(67, 97, 238, 0.05)';
            this.elements.uploadArea.style.borderColor = 'var(--primary-color)';
            
            if (event.dataTransfer.files.length) {
                this.elements.fileInput.files = event.dataTransfer.files;
                this.handleFileSelect({ target: { files: event.dataTransfer.files } });
            }
        });
        
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });
    }
    
    async loadModel() {
        try {
            this.updateProgress('Lade KI-Modell...', 30);
            this.updateModelStatus('Lädt...', 'warning');
            
            this.model = await cocoSsd.load({
                base: 'mobilenet_v2'
            });
            
            this.isModelLoaded = true;
            this.updateProgress('Modell geladen', 100);
            this.updateModelStatus('Bereit', 'success');
            
            setTimeout(() => {
                this.elements.progressText.textContent = 'Bereit für Analyse';
                this.elements.progressFill.style.width = '0%';
            }, 1500);
            
        } catch (error) {
            console.error('Fehler beim Laden des Modells:', error);
            this.updateProgress(`Fehler: ${error.message}`, 0);
            this.updateModelStatus('Fehler', 'error');
        }
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            this.updateProgress('Bitte nur JPG oder PNG Dateien hochladen', 0);
            return;
        }
        
        this.updateProgress('Verarbeite Bild...', 50);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImageData = e.target.result;
            this.elements.inputImage.src = this.currentImageData;
            this.elements.inputImage.onload = () => {
                this.updateProgress('Bild geladen, analysiere...', 75);
                this.analyzeImage();
            };
        };
        reader.readAsDataURL(file);
    }
    
    async analyzeImage() {
        if (!this.isModelLoaded) {
            this.updateProgress('Modell ist noch nicht geladen', 0);
            return;
        }
        
        try {
            const imgWidth = this.elements.inputImage.naturalWidth;
            const imgHeight = this.elements.inputImage.naturalHeight;
            
            // Canvas für Analyse einstellen
            this.elements.canvas.width = imgWidth;
            this.elements.canvas.height = imgHeight;
            
            // Perform detection
            const predictions = await this.model.detect(this.elements.inputImage);
            
            // Filter and count persons
            const personDetections = predictions.filter(p => 
                p.class === 'person' && p.score > 0.6
            );
            const personCount = personDetections.length;
            
            // Store current analysis
            this.currentAnalysis = {
                predictions,
                personDetections,
                personCount,
                imgWidth,
                imgHeight,
                timestamp: Date.now()
            };
            
            // Update UI
            this.updateResults(personCount);
            this.drawDetections(personDetections, imgWidth, imgHeight);
            this.updateProgress('Analyse abgeschlossen', 100);
            
            // Show image info
            this.elements.imageInfo.innerHTML = `
                <p><i class="fas fa-info-circle"></i> ${personCount} Personen erkannt | 
                Original: ${imgWidth}×${imgHeight}px</p>
            `;
            
            // Scale canvas for display
            this.scaleCanvasForDisplay();
            
        } catch (error) {
            console.error('Analysefehler:', error);
            this.updateProgress(`Fehler bei der Analyse: ${error.message}`, 0);
        }
    }
    
    scaleCanvasForDisplay() {
        const containerWidth = this.elements.imageContainer.clientWidth;
        const imgWidth = this.elements.inputImage.naturalWidth;
        const imgHeight = this.elements.inputImage.naturalHeight;
        
        const scale = Math.min(containerWidth / imgWidth, 1);
        const displayWidth = imgWidth * scale;
        const displayHeight = imgHeight * scale;
        
        this.elements.canvas.style.width = `${displayWidth}px`;
        this.elements.canvas.style.height = `${displayHeight}px`;
        this.elements.canvas.style.display = 'block';
        this.elements.imagePlaceholder.style.display = 'none';
    }
    
    updateResults(count) {
        this.elements.countDisplay.textContent = count;
        
        // Animation
        this.elements.countDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.elements.countDisplay.style.transform = 'scale(1)';
        }, 300);
        
        // Color based on count
        if (count === 0) {
            this.elements.countDisplay.style.color = '#dc3545';
        } else if (count <= 5) {
            this.elements.countDisplay.style.color = '#28a745';
        } else if (count <= 10) {
            this.elements.countDisplay.style.color = '#ffc107';
        } else {
            this.elements.countDisplay.style.color = '#fd7e14';
        }
    }
    
    drawDetections(detections, width, height, ctx = this.ctx) {
        // Clear and draw image
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(this.elements.inputImage, 0, 0, width, height);
        
        // Draw bounding boxes
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = Math.max(2, width / 500);
        ctx.fillStyle = '#00ff00';
        ctx.font = `bold ${Math.max(12, width / 60)}px Arial`;
        
        detections.forEach(prediction => {
            const [x, y, w, h] = prediction.bbox;
            const confidence = Math.round(prediction.score * 100);
            
            // Draw box
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.stroke();
            
            // Draw label background
            ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            const text = `Person ${confidence}%`;
            const textWidth = ctx.measureText(text).width;
            const textHeight = parseInt(ctx.font);
            ctx.fillRect(x, y > textHeight ? y - textHeight : 0, 
                        textWidth + 10, textHeight + 4);
            
            // Draw label text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, x + 5, y > textHeight ? y - 5 : textHeight - 5);
        });
    }
    
    // LocalStorage Functions
    saveCurrentImage() {
        if (!this.currentImageData || !this.currentAnalysis) {
            alert('Kein Bild zum Speichern verfügbar!');
            return;
        }
        
        const imageData = {
            id: Date.now().toString(),
            imageData: this.currentImageData,
            analysis: this.currentAnalysis,
            timestamp: this.currentAnalysis.timestamp,
            personCount: this.currentAnalysis.personCount,
            size: this.currentImageData.length
        };
        
        let history = this.getHistory();
        
        // Limit number of stored items
        if (history.length >= this.maxStorageItems) {
            history.shift(); // Remove oldest item
        }
        
        history.push(imageData);
        localStorage.setItem(this.storageKey, JSON.stringify(history));
        
        this.updateStorageInfo();
        this.loadHistory();
        
        // Feedback
        this.showNotification('Bild erfolgreich gespeichert!', 'success');
    }
    
    getHistory() {
        const historyStr = localStorage.getItem(this.storageKey);
        return historyStr ? JSON.parse(historyStr) : [];
    }
    
    loadHistory() {
        let history = this.getHistory();
        const sortBy = this.elements.sortBy.value;
        const filterCount = this.elements.filterCount.value;
        
        // Filter
        if (filterCount !== 'all') {
            history = history.filter(item => {
                const count = item.personCount;
                switch(filterCount) {
                    case '0': return count === 0;
                    case '1-5': return count >= 1 && count <= 5;
                    case '6-10': return count >= 6 && count <= 10;
                    case '10+': return count > 10;
                    default: return true;
                }
            });
        }
        
        // Sort
        history.sort((a, b) => {
            switch(sortBy) {
                case 'date-desc':
                    return b.timestamp - a.timestamp;
                case 'date-asc':
                    return a.timestamp - b.timestamp;
                case 'count-desc':
                    return b.personCount - a.personCount;
                case 'count-asc':
                    return a.personCount - b.personCount;
                default:
                    return b.timestamp - a.timestamp;
            }
        });
        
        // Update UI
        this.displayHistory(history);
    }
    
    displayHistory(history) {
        if (history.length === 0) {
            this.elements.historyEmpty.style.display = 'block';
            this.elements.historyGrid.innerHTML = '';
            return;
        }
        
        this.elements.historyEmpty.style.display = 'none';
        
        const html = history.map(item => {
            const date = new Date(item.timestamp);
            const dateStr = date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-image">
                        <img src="${item.imageData}" alt="Gespeichertes Bild">
                        <div class="history-badge">${item.personCount}</div>
                    </div>
                    <div class="history-info">
                        <div class="history-date">${dateStr}</div>
                        <div class="history-count">${item.personCount} Personen</div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.elements.historyGrid.innerHTML = html;
        
        // Add click listeners to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.showImageDetails(id);
            });
        });
    }
    
    showImageDetails(id) {
        const history = this.getHistory();
        const imageData = history.find(item => item.id === id);
        
        if (!imageData) return;
        
        this.selectedImageId = id;
        
        // Load image for modal
        const img = new Image();
        img.onload = () => {
            // Set canvas size
            this.elements.modalCanvas.width = img.width;
            this.elements.modalCanvas.height = img.height;
            
            // Draw image and detections
            this.modalCtx.drawImage(img, 0, 0);
            this.drawDetections(
                imageData.analysis.personDetections,
                img.width,
                img.height,
                this.modalCtx
            );
            
            // Scale modal canvas for display
            this.elements.modalCanvas.style.width = '100%';
            this.elements.modalCanvas.style.height = 'auto';
            
            // Update modal info
            this.elements.modalCount.textContent = imageData.personCount;
            this.elements.modalDate.textContent = new Date(imageData.timestamp).toLocaleString('de-DE');
            this.elements.modalSize.textContent = `${Math.round(imageData.size / 1024)} KB`;
            
            // Show modal
            this.elements.imageModal.classList.add('active');
        };
        img.src = imageData.imageData;
    }
    
    closeModal() {
        this.elements.imageModal.classList.remove('active');
        this.selectedImageId = null;
    }
    
    deleteSelectedImage() {
        if (!this.selectedImageId) return;
        
        if (confirm('Möchten Sie dieses Bild wirklich löschen?')) {
            let history = this.getHistory();
            history = history.filter(item => item.id !== this.selectedImageId);
            localStorage.setItem(this.storageKey, JSON.stringify(history));
            
            this.closeModal();
            this.loadHistory();
            this.updateStorageInfo();
            
            this.showNotification('Bild gelöscht!', 'success');
        }
    }
    
    async reanalyzeSelectedImage() {
        if (!this.selectedImageId || !this.isModelLoaded) return;
        
        const history = this.getHistory();
        const imageData = history.find(item => item.id === this.selectedImageId);
        
        if (!imageData) return;
        
        // Load image for reanalysis
        this.elements.inputImage.src = imageData.imageData;
        this.currentImageData = imageData.imageData;
        
        this.elements.inputImage.onload = async () => {
            this.updateProgress('Analysiere Bild erneut...', 50);
            
            try {
                const imgWidth = this.elements.inputImage.naturalWidth;
                const imgHeight = this.elements.inputImage.naturalHeight;
                
                this.elements.canvas.width = imgWidth;
                this.elements.canvas.height = imgHeight;
                
                // Perform new detection
                const predictions = await this.model.detect(this.elements.inputImage);
                const personDetections = predictions.filter(p => 
                    p.class === 'person' && p.score > 0.6
                );
                const personCount = personDetections.length;
                
                // Update analysis data
                imageData.analysis = {
                    predictions,
                    personDetections,
                    personCount,
                    imgWidth,
                    imgHeight,
                    timestamp: Date.now()
                };
                imageData.personCount = personCount;
                imageData.timestamp = Date.now();
                
                // Update storage
                const updatedHistory = history.map(item => 
                    item.id === this.selectedImageId ? imageData : item
                );
                localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
                
                // Update UI
                this.updateResults(personCount);
                this.drawDetections(personDetections, imgWidth, imgHeight);
                this.scaleCanvasForDisplay();
                this.closeModal();
                this.loadHistory();
                this.updateStorageInfo();
                
                this.updateProgress('Neuanalyse abgeschlossen', 100);
                this.showNotification('Bild neu analysiert!', 'success');
                
            } catch (error) {
                console.error('Neuanalyse fehlgeschlagen:', error);
                this.updateProgress('Neuanalyse fehlgeschlagen', 0);
            }
        };
    }
    
    clearHistory() {
        if (confirm('Möchten Sie wirklich alle gespeicherten Bilder löschen?')) {
            localStorage.removeItem(this.storageKey);
            this.loadHistory();
            this.updateStorageInfo();
            this.showNotification('Alle Bilder gelöscht!', 'success');
        }
    }
    
    updateStorageInfo() {
        const history = this.getHistory();
        const totalSize = history.reduce((sum, item) => sum + item.size, 0);
        const sizeKB = Math.round(totalSize / 1024);
        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        this.elements.storageCount.textContent = `${history.length} Bilder`;
        this.elements.storageUsage.textContent = sizeKB < 1024 ? 
            `${sizeKB} KB verwendet` : `${sizeMB} MB verwendet`;
    }
    
    manageStorage() {
        const history = this.getHistory();
        const totalSize = history.reduce((sum, item) => sum + item.size, 0);
        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        alert(`Storage-Informationen:\n
• Gespeicherte Bilder: ${history.length}/${this.maxStorageItems}
• Verwendeter Speicher: ${sizeMB} MB
• Maximal empfohlen: 5 MB\n
Hinweis: Bei zu vielen Bildern kann die Performance leiden.
Löschen Sie ältere Bilder, um Speicherplatz freizugeben.`);
    }
    
    // Utility functions
    updateProgress(text, percentage) {
        this.elements.progressText.textContent = text;
        this.elements.progressFill.style.width = `${percentage}%`;
    }
    
    updateModelStatus(text, status) {
        this.elements.modelStatus.textContent = text;
        this.elements.modelStatus.className = `confidence-value status-indicator ${status}`;
    }
    
    handleResize() {
        if (this.currentImageData) {
            this.scaleCanvasForDisplay();
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new PersonCounter();
});

// Add notification styles dynamically
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 2000;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
    max-width: 300px;
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification-success {
    border-left: 4px solid #28a745;
    color: #155724;
    background: #d4edda;
}

.notification-success i {
    color: #28a745;
}

.notification-info {
    border-left: 4px solid #17a2b8;
    color: #0c5460;
    background: #d1ecf1;
}

.notification-info i {
    color: #17a2b8;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
