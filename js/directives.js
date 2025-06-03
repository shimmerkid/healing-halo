// DIRECTIVE MANAGEMENT WITH TEMPORAL FILTERING

class DirectiveManager {
    static STORAGE_KEY = 'directiveStates';
    static DIRECTIVES_KEY = 'adminDirectives';

    static init() {
        this.directivesList = document.getElementById('directivesList');
        this.loadDirectives();
    }

    static loadDirectives() {
        const directives = this.getActiveDirectives();
        //const directives = this.getDirectives();
        const states = this.getDirectiveStates();
        this.directivesList.innerHTML = '';

        if (directives.length === 0) {
            this.directivesList.innerHTML = '<div class="text-gray-400 text-center p-4">NO ACTIVE DIRECTIVES FOR TODAY<br>CHECK ADMIN PANEL FOR SCHEDULING</div>';
            return;
        }

        directives.forEach(directive => {
            const isCompleted = states[directive.id] || false;
            
            const directiveEl = document.createElement('div');
            directiveEl.className = 'flex items-center p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors';
            
            // FORMAT SCHEDULE INFO
            const scheduleInfo = this.formatScheduleInfo(directive);
            
            directiveEl.innerHTML = `
                <input 
                    type="checkbox" 
                    class="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    ${isCompleted ? 'checked' : ''}
                    data-directive-id="${directive.id}"
                >
                <div class="flex-1">
                    <div class="text-white ${isCompleted ? 'line-through opacity-60' : ''}">${directive.text}</div>
                    <div class="text-xs text-gray-400">${directive.category} • ${scheduleInfo}</div>
                </div>
            `;

            const checkbox = directiveEl.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                this.toggleDirective(directive.id, e.target.checked);
            });

            this.directivesList.appendChild(directiveEl);
        });
    }

    static formatScheduleInfo(directive) {
        if (directive.recurring) {
            return `${directive.recurrencePattern.toUpperCase()}`;
        } else if (directive.endDate) {
            return `${directive.startDate} TO ${directive.endDate}`;
        } else {
            return directive.startDate;
        }
    }

    static getActiveDirectives() {
        const allDirectives = this.getDirectives();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD FORMAT
        
        return allDirectives.filter(directive => {
            return this.isDirectiveActiveToday(directive, today);
        });
    }

    static isDirectiveActiveToday(directive, today) {
        const startDate = directive.startDate;
        const endDate = directive.endDate;
        
        // CHECK IF TODAY IS BEFORE START DATE
        if (today < startDate) return false;
        
        // CHECK IF TODAY IS AFTER END DATE (IF SET)
        if (endDate && today > endDate) return false;
        
        // IF NOT RECURRING, ONLY ACTIVE ON START DATE
        if (!directive.recurring) {
            return today === startDate;
        }
        
        // HANDLE RECURRING PATTERNS
        return this.checkRecurrencePattern(directive, today);
    }

    static checkRecurrencePattern(directive, today) {
        const startDate = new Date(directive.startDate);
        const currentDate = new Date(today);
        const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
        
        switch (directive.recurrencePattern) {
            case 'daily':
                return daysDiff >= 0;
            case 'weekly':
                return daysDiff >= 0 && daysDiff % 7 === 0;
            case 'weekdays':
                const dayOfWeek = currentDate.getDay();
                return daysDiff >= 0 && dayOfWeek >= 1 && dayOfWeek <= 5;
            case 'weekends':
                const weekendDay = currentDate.getDay();
                return daysDiff >= 0 && (weekendDay === 0 || weekendDay === 6);
            default:
                return daysDiff >= 0; // DEFAULT TO DAILY
        }
    }

    static toggleDirective(directiveId, completed) {
        const states = this.getDirectiveStates();
        const today = new Date().toISOString().split('T')[0];
        const stateKey = `${directiveId}`; // DATE-SPECIFIC COMPLETION
        
        states[stateKey] = completed;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
        
        this.loadDirectives();
        
        // TRIGGER SCORE UPDATE
        document.dispatchEvent(new CustomEvent('dataChange'));
    }

    static getDirectiveStates() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    }

    static getCompletionStats() {
        const activeDirectives = this.getActiveDirectives();
        const states = this.getDirectiveStates();
        const today = new Date().toISOString().split('T')[0];
        
        let completed = 0;
        activeDirectives.forEach(directive => {
            const stateKey = `${directive.id}`;
            if (states[stateKey]) completed++;
        });
        
        const total = activeDirectives.length;
        
        return {
            completed,
            total,
            percentage: total > 0 ? (completed / total) * 100 : 0
        };
    }

    static getDirectives() {
        const stored = localStorage.getItem(this.DIRECTIVES_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    static addDirective(text, category, startDate, endDate, recurring, recurrencePattern) {
        const directives = this.getDirectives();
        const newDirective = {
            id: Date.now(),
            text: text.toUpperCase(),
            category: category.toUpperCase(),
            startDate: startDate,
            endDate: endDate || null,
            recurring: recurring,
            recurrencePattern: recurring ? recurrencePattern : null,
            dateAdded: new Date().toISOString()
        };
        
        directives.push(newDirective);
        localStorage.setItem(this.DIRECTIVES_KEY, JSON.stringify(directives));
        this.loadDirectives();
    }

    static removeDirective(directiveId) {
        const directives = this.getDirectives();
        const filtered = directives.filter(d => d.id !== directiveId);
        localStorage.setItem(this.DIRECTIVES_KEY, JSON.stringify(filtered));
        
        // CLEAN UP STATES
        const states = this.getDirectiveStates();
        Object.keys(states).forEach(key => {
            if (key.startsWith(`${directiveId}-`)) {
                delete states[key];
            }
        });
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
        
        this.loadDirectives();
    }

    static resetDirectives() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.loadDirectives();
        document.dispatchEvent(new CustomEvent('dataChange'));
    }

    static getAllDirectives() {
        // FOR ADMIN VIEW - RETURNS ALL DIRECTIVES REGARDLESS OF DATE
        return this.getDirectives();
    }

    static getDirectivesForDate(targetDate) {
        // FOR HISTORY BROWSING
        const allDirectives = this.getDirectives();
        return allDirectives.filter(directive => {
            return this.isDirectiveActiveToday(directive, targetDate);
        });
    }
}