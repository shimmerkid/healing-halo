/*
TODO

in the directive getCompletionStats function,
    add an array variable containing all directives completed over the last 3 days
    add an integer variable representing the current streak. Specifically, the number of consecutive days during which 50 percent or more directives were completed

*/

        demoState = false;
        scoreGlobal = 0;


class HealingOracle {
    constructor() {
        this.haloFrame = document.getElementById('haloFrame');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.adminModal = document.getElementById('adminModal');
        this.journalModal = document.getElementById('journalModal');
        this.sliders = document.getElementById('controls')
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
        this.initializeEntriesPane();
        
        // Initialize directives pane after a delay to ensure content is loaded
        setTimeout(() => {
            this.initializeDirectivesPane();
        }, 100);
        
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

        document.getElementById('demoSwitch').addEventListener('click', () => {
            let toggle = document.getElementById("demoSwitch");
            if (toggle.checked) {
                this.sliders.classList.remove('hidden');
                demoState = true;
            } else {
                this.sliders.classList.add('hidden');
                demoState = false;
            }
            this.updateDisplay();
        });
        document.getElementById('today_percent').addEventListener('input', () => {
            this.updateDisplay();
        });
        document.getElementById('3day_percent').addEventListener('input', () => {
            this.updateDisplay();
        });
        document.getElementById('score').addEventListener('input', () => {
            this.updateDisplay();
        });
        document.getElementById('tier_variety').addEventListener('input', () => {
            this.updateDisplay();
        });

        document.getElementById('showAdmin').addEventListener('click', () => {
            this.adminModal.classList.add('active');
            DirectiveManager.cancelEdit();
        });

        document.getElementById('closeAdminModal').addEventListener('click', () => {
            this.adminModal.classList.remove('active');
        });

        // Close modal when clicking outside content
        this.adminModal.addEventListener('click', (e) => {
            if (e.target === this.adminModal) {
                this.adminModal.classList.remove('active');
            }
        });

        // Journal modal interactions
        document.getElementById('showJournalModal').addEventListener('click', () => {
            this.journalModal.classList.add('active');
        });

        document.getElementById('closeJournalModal').addEventListener('click', () => {
            this.journalModal.classList.remove('active');
        });

        document.getElementById('cancelJournalEntry').addEventListener('click', () => {
            this.journalModal.classList.remove('active');
            this.clearJournalForm();
        });

        // Close journal modal when clicking outside content
        this.journalModal.addEventListener('click', (e) => {
            if (e.target === this.journalModal) {
                this.journalModal.classList.remove('active');
                this.clearJournalForm();
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.adminModal.classList.contains('active')) {
                    this.adminModal.classList.remove('active');
                }
                if (this.journalModal.classList.contains('active')) {
                    this.journalModal.classList.remove('active');
                    this.clearJournalForm();
                }
            }
        });

        // Collapsible entries pane
        document.getElementById('toggleEntries').addEventListener('click', () => {
            this.toggleEntriesPane();
        });

        // Collapsible directives pane
        document.getElementById('toggleDirectives').addEventListener('click', () => {
            this.toggleDirectivesPane();
        });

        document.getElementById('addDirective').addEventListener('click', () => {
            this.addDirective(document.getElementById('addDirective').getAttribute('data-edit-id'));
            DirectiveManager.cancelEdit();
        });

        document.getElementById('deleteDirective').addEventListener('click', () => {

            this.removeDirective(document.getElementById('addDirective').getAttribute('data-edit-id'));
            DirectiveManager.cancelEdit();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.adminModal.classList.remove('active');
            DirectiveManager.cancelEdit();
        });

        document.getElementById('directiveText').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.addDirective();
            }
        });
    }

addDirective(editID) {
    const text = document.getElementById('directiveText').value.trim();
    const tier = document.getElementById('directiveTier').value;
    const category = document.getElementById('directiveCategory').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const recurring = document.getElementById('recurringToggle').checked;
    const recurrencePattern = document.getElementById('recurrencePattern').value;
    
    if (!text || !startDate) {
        alert('TEXT AND START DATE REQUIRED');
        return;
    }

    console.log("editID");
    console.log(editID);
    
    if (editID) {
        DirectiveManager.updateDirective(editID, text, tier, category, startDate, endDate, recurring, recurrencePattern);
    } else {
        DirectiveManager.addDirective(text, tier, category, startDate, endDate, recurring, recurrencePattern, null);

    // CLEAR FORM
    document.getElementById('directiveText').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('recurringToggle').checked = false;
    document.getElementById('recurrencePattern').disabled = true;
    }
    
    
    this.updateDisplay();
} 

removeDirective(editID) {
    DirectiveManager.removeDirective(editID);
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
        scoreGlobal = newScore;
        const roundedScore = Math.round(newScore);
        this.scoreDisplay.innerHTML = `
            <span class="absolute inset-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent blur-sm">${roundedScore}</span>
            <span class="relative bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">${roundedScore}</span>
        `;
    }

    updateVertices(vertices) {
        this.currentVertices = vertices;
        this.sendVerticesToHalo(vertices);
    }

    sendVerticesToHalo(vertices) {
        // SEND VERTEX DATA TO HALO
        try {
            size = vertices.normScore*0.25 + 0.2;
            ringCount = 25 + 125*vertices.normScore;

            mainColor = vertices.mainColor;
            centerColor = vertices.centerColor;

            color1 = vertices.color1;
            color2 = vertices.color2;
            color3 = vertices.color3;

            rotationSpeed = -vertices.delta/4000.0*0;
            radialVelocity = 3 + 0.01*vertices.percentage + Math.abs(vertices.delta)/24.0;
            twist = -0.25*vertices.normScore - vertices.delta/200.0;
            complexity = 0.75 + 0.125*vertices.percentage/100.0 + 0.125*vertices.tierVariety;
            radialRange = 2.0 + 3.0*vertices.tierVariety;
            extent = 3.0 + 3.0*vertices.tierVariety;

            console.log('VERTICES SENT TO HALO:', vertices);
        } catch (e) {
            console.log('HALO NOT READY YET');
        }
    }

    clearJournalForm() {
        document.getElementById('journalInputTitle').value = '';
        document.getElementById('journalInput').value = '';
    }

    initializeEntriesPane() {
        const collapsible = document.getElementById('entriesCollapsible');
        const icon = document.getElementById('entriesToggleIcon');
        const isExpanded = localStorage.getItem('entriesExpanded') === 'true'; // Default to collapsed
        
        if (isExpanded) {
            collapsible.style.maxHeight = collapsible.scrollHeight + 'px';
            icon.style.transform = 'rotate(180deg)';
        } else {
            collapsible.style.maxHeight = '0px';
            icon.style.transform = 'rotate(0deg)';
        }
    }

    initializeDirectivesPane() {
        const collapsible = document.getElementById('directivesCollapsible');
        const icon = document.getElementById('directivesToggleIcon');
        const isExpanded = localStorage.getItem('directivesExpanded') === 'true'; // Default to collapsed
        
        if (isExpanded) {
            // Use the same technique as the toggle function
            collapsible.style.maxHeight = 'none';
            setTimeout(() => {
                collapsible.style.maxHeight = collapsible.scrollHeight + 'px';
            }, 10);
            icon.style.transform = 'rotate(180deg)'; // Up arrow when expanded
        } else {
            collapsible.style.maxHeight = '0px';
            icon.style.transform = 'rotate(0deg)'; // Down arrow when collapsed
        }
    }

    toggleEntriesPane() {
        const collapsible = document.getElementById('entriesCollapsible');
        const icon = document.getElementById('entriesToggleIcon');
        
        if (collapsible.style.maxHeight === '0px') {
            // Expand - use setTimeout to ensure DOM is fully rendered
            collapsible.style.maxHeight = 'none'; // Temporarily remove constraint
            setTimeout(() => {
                collapsible.style.maxHeight = collapsible.scrollHeight + 'px';
            }, 10);
            icon.style.transform = 'rotate(180deg)';
            localStorage.setItem('entriesExpanded', 'true');
        } else {
            // Collapse
            collapsible.style.maxHeight = '0px';
            icon.style.transform = 'rotate(0deg)';
            localStorage.setItem('entriesExpanded', 'false');
        }
    }

    toggleDirectivesPane() {
        const collapsible = document.getElementById('directivesCollapsible');
        const icon = document.getElementById('directivesToggleIcon');
        
        if (collapsible.style.maxHeight === '0px' || collapsible.style.maxHeight === '') {
            // Expand - use setTimeout to ensure DOM is fully rendered
            collapsible.style.maxHeight = 'none'; // Temporarily remove constraint
            setTimeout(() => {
                collapsible.style.maxHeight = collapsible.scrollHeight + 'px';
            }, 10);
            icon.style.transform = 'rotate(180deg)'; // Up arrow when expanded
            localStorage.setItem('directivesExpanded', 'true');
        } else {
            // Collapse
            collapsible.style.maxHeight = '0px';
            icon.style.transform = 'rotate(0deg)'; // Down arrow when collapsed
            localStorage.setItem('directivesExpanded', 'false');
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