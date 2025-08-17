// JOURNAL ENTRY MANAGEMENT

class JournalManager {
    static STORAGE_KEY = 'journalEntries';

    static init() {
        this.journalInput = document.getElementById('journalInput');
        this.journalInputTitle = document.getElementById('journalInputTitle');
        this.submitButton = document.getElementById('submitEntry');
        this.cancelButton = document.getElementById('cancelEntry');
        this.openModalButton = document.getElementById('openJournalModal');
        this.closeModalButton = document.getElementById('closeJournalModal');
        this.journalModal = document.getElementById('journalModal');
        this.entriesList = document.getElementById('entriesList');

        this.setupEventListeners();
        this.loadEntries();
    }

    static setupEventListeners() {
        this.submitButton.addEventListener('click', () => {
            this.submitEntry();
        });

        this.cancelButton.addEventListener('click', () => {
            this.closeModal();
        });

        this.openModalButton.addEventListener('click', () => {
            this.openModal();
        });

        this.closeModalButton.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        this.journalModal.addEventListener('click', (e) => {
            if (e.target === this.journalModal) {
                this.closeModal();
            }
        });

        this.journalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.submitEntry();
            } else if (e.key === 'Escape') {
                this.closeModal();
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
        this.closeModal();
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
    }

    static loadEntries() {
        const entries = this.getEntries();
        this.entriesList.innerHTML = '';

        entries.slice(0, 10).forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'p-5 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300';
            
            const date = new Date(entry.timestamp).toLocaleDateString();
            const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            
            entryEl.innerHTML = `
                <div class="text-sm mb-2 web3-glow" style="color: var(--web3-cyan);">${date} ${time} • ${entry.wordCount} WORDS</div>
                <div class="text-white font-semibold mb-3 text-lg">${entry.title}</div>
                <div id="text-${entry.id}" class="text-gray-200 mb-4 font-mono text-sm leading-relaxed" style="display: none;">${entry.text}</div>
                <div class="flex gap-3 justify-end">
                    <button 
                        id="toggle-${entry.id}" 
                        class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer"
                        onclick="JournalManager.toggleEntryText(${entry.id})"
                    >
                        SHOW TEXT
                    </button>
                    <button 
                        class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 bg-red-600/80 hover:bg-red-500 border border-red-500/30 hover:border-red-400 cursor-pointer"
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

    static openModal() {
        this.journalModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            this.journalInputTitle.focus();
        }, 300);
    }

    static closeModal() {
        this.journalModal.classList.remove('active');
        document.body.style.overflow = '';
        this.journalInput.value = '';
        this.journalInputTitle.value = '';
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