// JOURNAL ENTRY MANAGEMENT

class JournalManager {
    static STORAGE_KEY = 'journalEntries';

    static init() {
        this.journalInput = document.getElementById('journalInput');
        this.journalInputTitle = document.getElementById('journalInputTitle');
        this.submitButton = document.getElementById('submitEntry');
        this.entriesList = document.getElementById('entriesList');

        this.setupEventListeners();
        this.loadEntries();
    }

    static setupEventListeners() {
        this.submitButton.addEventListener('click', () => {
            this.submitEntry();
        });

        this.journalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.submitEntry();
            }
        });
    }

    static submitEntry() {
        const title = this.journalInputTitle.value.trim();
        const text = this.journalInput.value.trim();
        if (!text || !title) return;

        const entry = {
            id: Date.now(),
            title: title,
            text: text,
            timestamp: new Date().toISOString(),
            wordCount: text.split(/\s+/).length
        };

        this.saveEntry(entry);
        this.journalInput.value = '';
        this.journalInputTitle.value = '';
        this.loadEntries();
        
        // Close the journal modal
        const journalModal = document.getElementById('journalModal');
        if (journalModal) {
            journalModal.classList.remove('active');
        }
        
        // Update collapsible height after loading entries
        this.recalculateEntriesHeight();
        
        // TRIGGER SCORE UPDATE
        document.dispatchEvent(new CustomEvent('dataChange'));
    }

    static saveEntry(entry) {
        const entries = this.getEntries();
        entries.unshift(entry);
        
        // KEEP ONLY LAST 50 ENTRIES
        if (entries.length > 50) {
            entries.splice(50);
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    }

    static getEntries() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    static deleteEntry(entryId) {
        const entries = this.getEntries();
        const filtered = entries.filter(entry => entry.id !== entryId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        this.loadEntries();
        
        // TRIGGER SCORE UPDATE
        document.dispatchEvent(new CustomEvent('dataChange'));
    }

    static toggleEntryText(entryId) {
        const textElement = document.getElementById(`text-${entryId}`);
        const button = document.getElementById(`toggle-${entryId}`);
        
        if (textElement.style.display === 'none') {
            textElement.style.display = 'block';
            button.textContent = 'HIDE TEXT';
        } else {
            textElement.style.display = 'none';
            button.textContent = 'SHOW TEXT';
        }
        
        // Force immediate height recalculation
        this.recalculateEntriesHeight();
    }
    
    static recalculateEntriesHeight() {
        const collapsible = document.getElementById('entriesCollapsible');
        if (!collapsible) return;
        
        // Only recalculate if pane is currently expanded
        if (collapsible.style.maxHeight === '0px' || collapsible.style.maxHeight === '') {
            return;
        }
        
        // Temporarily disable transition to avoid interference
        const originalTransition = collapsible.style.transition;
        collapsible.style.transition = 'none';
        
        // Remove height constraint and measure
        collapsible.style.maxHeight = 'none';
        const newHeight = collapsible.scrollHeight;
        
        // Set new height
        collapsible.style.maxHeight = newHeight + 'px';
        
        // Force reflow to apply changes immediately
        collapsible.offsetHeight;
        
        // Re-enable transition
        collapsible.style.transition = originalTransition;
    }

    static loadEntries() {
        const entries = this.getEntries();
        this.entriesList.innerHTML = '';

        entries.slice(0, 10).forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'journal-entry-card';
            
            const date = new Date(entry.timestamp).toLocaleDateString();
            const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            
            entryEl.innerHTML = `
                <div class="journal-entry-header">
                    <div class="journal-entry-meta">
                        <span class="journal-date">${date}</span>
                        <span class="journal-time">${time}</span>
                        <span class="journal-wordcount">${entry.wordCount} WORDS</span>
                    </div>
                    <div class="journal-entry-title">${entry.title}</div>
                </div>
                <div id="text-${entry.id}" class="journal-entry-text" style="display: none;">${entry.text}</div>
                <div class="journal-entry-actions">
                    <button 
                        id="toggle-${entry.id}" 
                        class="journal-btn journal-btn-show"
                        onclick="JournalManager.toggleEntryText(${entry.id})"
                    >
                        SHOW TEXT
                    </button>
                    <button 
                        class="journal-btn journal-btn-delete"
                        onclick="JournalManager.confirmDelete(${entry.id}, '${entry.title}')"
                    >
                        DELETE
                    </button>
                </div>
            `;
            
            this.entriesList.appendChild(entryEl);
        });
    }

    static confirmDelete(entryId, entryTitle) {
        if (confirm(`DELETE ENTRY: "${entryTitle}"?`)) {
            this.deleteEntry(entryId);
        }
    }

    static getEntryStats() {
        const entries = this.getEntries();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
            total: entries.length,
            todayCount: entries.filter(e => new Date(e.timestamp) >= today).length,
            weekCount: entries.filter(e => new Date(e.timestamp) >= week).length,
            avgWordCount: entries.length ? entries.reduce((sum, e) => sum + e.wordCount, 0) / entries.length : 0,
            lastEntry: entries[0] ? new Date(entries[0].timestamp) : null
        };
    }
}