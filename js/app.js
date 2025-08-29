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
        this.adminPanel = document.getElementById('adminPanel');
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
            this.adminPanel.classList.remove('hidden');
            DirectiveManager.cancelEdit();
        });

        document.getElementById('toggleAdmin').addEventListener('click', () => {
            this.adminPanel.classList.add('hidden');
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
            this.adminPanel.classList.add('hidden');
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
        this.scoreDisplay.textContent = Math.round(newScore);
    }

    updateVertices(vertices) {
        this.currentVertices = vertices;
        this.sendVerticesToHalo(vertices);
    }

    sendVerticesToHalo(vertices) {
        // SEND VERTEX DATA TO HALO
        try {
            size = vertices.normScore*0.25 + 0.3;
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