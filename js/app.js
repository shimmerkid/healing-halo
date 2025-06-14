class HealingOracle {
    constructor() {
        this.haloFrame = document.getElementById('haloFrame');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.adminPanel = document.getElementById('adminPanel');
        this.currentScore = 0;
        this.currentVertices = null;
    }

    init() {
        // INITIALIZE ALL MODULES
        JournalManager.init();
        DirectiveManager.init();
        
        // SETUP EVENT LISTENERS
        this.setupEventListeners();
        
        // INITIAL LOAD
        this.updateDisplay();
        
        console.log('HEALING ORACLE INITIALIZED');
    }

    setupEventListeners() {

        // RECURRING TOGGLE HANDLER
document.getElementById('recurringToggle').addEventListener('change', (e) => {
    document.getElementById('recurrencePattern').disabled = !e.target.checked;
});
        // LISTEN FOR SCORE UPDATES
        document.addEventListener('scoreUpdate', (e) => {
            this.updateScore(e.detail.score);
        });

        // LISTEN FOR DATA CHANGES
        document.addEventListener('dataChange', () => {
            this.updateDisplay();
        });

        // ADMIN PANEL CONTROLS
        document.getElementById('showAdmin').addEventListener('click', () => {
            this.adminPanel.classList.remove('hidden');
        });

        document.getElementById('toggleAdmin').addEventListener('click', () => {
            this.adminPanel.classList.add('hidden');
        });

        document.getElementById('addDirective').addEventListener('click', () => {
            this.addDirective();
        });

        document.getElementById('directiveText').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.addDirective();
            }
        });
    }

addDirective() {
    const text = document.getElementById('directiveText').value.trim();
    const category = document.getElementById('directiveCategory').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const recurring = document.getElementById('recurringToggle').checked;
    const recurrencePattern = document.getElementById('recurrencePattern').value;
    
    if (!text || !startDate) {
        alert('TEXT AND START DATE REQUIRED');
        return;
    }
    
    DirectiveManager.addDirective(text, category, startDate, endDate, recurring, recurrencePattern);
    
    // CLEAR FORM
    document.getElementById('directiveText').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('recurringToggle').checked = false;
    document.getElementById('recurrencePattern').disabled = true;
    
    this.updateDisplay();
} 

    addDirective2() {
        const text = document.getElementById('directiveText').value.trim();
        const category = document.getElementById('directiveCategory').value;
        
        if (!text) return;
        
        DirectiveManager.addDirective(text, category);
        document.getElementById('directiveText').value = '';
        
        this.updateDisplay();
    }

    updateScore(newScore) {
        this.currentScore = newScore;
        this.scoreDisplay.textContent = Math.round(newScore);
    }

    updateVertices(vertices) {
        this.currentVertices = vertices;
        this.sendVerticesToHalo(vertices);
    }

    sendVerticesToHalo(vertices) {
        // SEND VERTEX DATA TO HALO
        try {
            this.haloFrame.contentWindow.postMessage({
                type: 'VERTEX_UPDATE',
                vertices: vertices
            }, '*');
            console.log('VERTICES SENT TO HALO:', vertices);
        } catch (e) {
            console.log('HALO NOT READY YET');
        }
    }

    updateDisplay() {
        // CALCULATE VERTICES AND LEGACY SCORE
        const vertices = ScoreCalculator.calculateVertices();
        const legacyScore = ScoreCalculator.calculateScore();
        
        // UPDATE DISPLAYS
        this.updateScore(legacyScore);
        this.updateVertices(vertices);
    }
}

// INITIALIZE APP WHEN DOM LOADED
document.addEventListener('DOMContentLoaded', () => {
    const app = new HealingOracle();
    app.init();
});