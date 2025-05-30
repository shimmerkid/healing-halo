class JournalManager {
    static STORAGE_KEY = 'journalEntries';

    static init() {
        this.journalInput = document.getElementById('journalInput');
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
        const text = this.journalInput.value.trim();
        if (!text) return;

        const entry = {
            id: Date.now(),
            text: text,
            timestamp: new Date().toISOString(),
            wordCount: text.split(/\s+/).length
        };

        this.saveEntry(entry);
        this.journalInput.value = '';
        this.loadEntries();
        
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

    static loadEntries() {
        const entries = this.getEntries();
        this.entriesList.innerHTML = '';

        entries.slice(0, 10).forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'p-3 bg-gray-800 rounded border-l-4 border-blue-500';
            
            const date = new Date(entry.timestamp).toLocaleDateString();
            const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            entryEl.innerHTML = `
                <div class="text-sm text-gray-400 mb-1">${date} ${time} • ${entry.wordCount} WORDS</div>
                <div class="text-white">${entry.text}</div>
            `;
            
            this.entriesList.appendChild(entryEl);
        });
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