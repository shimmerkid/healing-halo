// DIRECTIVE MANAGEMENT WITH TEMPORAL FILTERING AND EDITING

class DirectiveManager {
        static STORAGE_KEY = 'states';
        static DIRECTIVES_KEY = 'directives';

        static init() {
                //this.resetDirectives(); //delete all directives
                this.directivesList = document.getElementById('directivesList');
                //this.generateRecurringInstances();
                this.loadDirectives();


        }

        static toLocalISOString(d) {
            return new Date(d.getTime() - d.getTimezoneOffset()*60000 - 0*24*60*60*1000).toISOString();
        }

        static loadDirectives() {
                console.log(this.getAllDirectives())
                console.log(this.getDirectiveStates())
                const directives = this.getActiveDirectives();//.filter(d => { return !d.recurring; });//this.getActiveDirectives();
                const states = this.getDirectiveStates();
                const today = this.toLocalISOString(new Date()).split('T')[0]; // YYYY-MM-DD FORMAT
                this.directivesList.innerHTML = '';

                if (directives.length === 0) {
                        this.directivesList.innerHTML = '<div class="text-gray-400 text-center p-4">NO ACTIVE DIRECTIVES FOR TODAY<br>CHECK ADMIN PANEL FOR SCHEDULING</div>';
                        return;
                }

                directives.forEach(directive => {
                        //this.removeDirective(directive.id);
                        const stateKey = this.genStateKey(directive.id, today);
                        const isCompleted = states[stateKey] || false;
                        
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
                                        <div class="text-xs text-gray-400">${directive.tier}</div>
                                        <div class="text-xs text-gray-400">${directive.category}</div>
                                        <div class="text-xs text-gray-400">${scheduleInfo.dates} • ${scheduleInfo.pattern}</div>
                                </div>
                                <button 
                                        class="ml-2 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs text-white"
                                        onclick="DirectiveManager.editDirective(${directive.id})"
                                >
                                        EDIT
                                </button>
                        `;

                        const checkbox = directiveEl.querySelector('input[type="checkbox"]');
                        checkbox.addEventListener('change', (e) => {
                                this.toggleDirective(directive.id, e.target.checked);
                        });

                        this.directivesList.appendChild(directiveEl);
                });
        }

        static formatScheduleInfo(directive) {

                let schedule = [];
                schedule.dates = '';
                schedule.pattern = '';
                if (directive.template) {
                        schedule.pattern += `${directive.recurrencePattern.toUpperCase()}`;
                }
                if (directive.endDate) {
                        schedule.dates += `${directive.startDate} TO ${directive.endDate}`;
                } else {
                        schedule.dates += directive.startDate;
                }
            return schedule;
        }

        static editDirective(directiveId) {
                const directive = this.getDirectives().find(d => d.id === directiveId);
                if (!directive) return;

                // SHOW ADMIN PANEL
                document.getElementById('adminPanel').classList.remove('hidden');
                
                // POPULATE FORM WITH DIRECTIVE DATA
                document.getElementById('directiveText').value = directive.text;
                document.getElementById('directiveCategory').value = directive.category;
                document.getElementById('startDate').value = directive.startDate;
                document.getElementById('endDate').value = directive.endDate || '';
                document.getElementById('recurringToggle').checked = directive.recurring;
                document.getElementById('recurrencePattern').disabled = !directive.recurring;
                document.getElementById('recurrencePattern').value = directive.recurrencePattern || 'daily';

                // SWITCH TO EDIT MODE
                document.getElementById('adminTitle').textContent = 'ADMIN - EDIT DIRECTIVE';
                document.getElementById('addDirective').textContent = 'UPDATE DIRECTIVE';
                document.getElementById('addDirective').setAttribute('data-edit-id', directiveId);
                
                // SHOW CANCEL AND DELETE BUTTON
                document.getElementById('cancelEdit').classList.remove('hidden');
                document.getElementById('deleteDirective').classList.remove('hidden');
        }

        static cancelEdit() {
                // CLEAR FORM
                document.getElementById('directiveText').value = '';
                document.getElementById('directiveCategory').value = 'MINDFULNESS';
                document.getElementById('startDate').value = '';
                document.getElementById('endDate').value = '';
                document.getElementById('recurringToggle').checked = false;
                document.getElementById('recurrencePattern').disabled = true;

                // SWITCH BACK TO ADD MODE
                document.getElementById('adminTitle').textContent = 'ADMIN - ADD DIRECTIVE';
                document.getElementById('addDirective').textContent = 'ADD DIRECTIVE';
                document.getElementById('addDirective').removeAttribute('data-edit-id');
                
                // HIDE CANCEL BUTTON
                document.getElementById('cancelEdit').classList.add('hidden');
                document.getElementById('deleteDirective').classList.add('hidden');
        }

        static getActiveDirectives() {
                const allDirectives = this.getDirectives();
                const today = this.toLocalISOString(new Date()).split('T')[0]; // YYYY-MM-DD FORMAT

                console.log("TODAY : " + today);
                
                return allDirectives.filter(directive => {
                        const states = this.getDirectiveStates();
                        return (this.isDirectiveActiveToday(directive, today));
                });
        }

        static isDirectiveActiveToday(directive, today) {
                const startDate = directive.startDate;
                const endDate = directive.endDate;
                const states = this.getDirectiveStates();

                //if (states[`${directive.id}`]) return false;
                
                // CHECK IF TODAY IS BEFORE START DATE
                if (today < startDate) return false;
                
                // CHECK IF TODAY IS AFTER END DATE (IF SET)
                if (endDate && today > endDate) return false;
                //else if (endDate && today <= endDate) return true;
                
                // IF NOT RECURRING, ACTIVE ON START DATE ONLY
                if (!directive.recurring) {
                        return startDate === today;
                }
                
                // HANDLE RECURRING PATTERNS
                return this.checkRecurrencePattern(directive, today);
        }

static isDirectiveCompletedToday(directive, today) {
                const completionDate = directive.dateCompleted;
                
                return today === completionDate;
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
                const today = this.toLocalISOString(new Date()).split('T')[0];
                const stateKey = this.genStateKey(directiveId, today); // DATE-SPECIFIC COMPLETION
                
                states[stateKey] = completed;
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));

                
                this.loadDirectives();
                
                // TRIGGER SCORE UPDATE
                document.dispatchEvent(new CustomEvent('dataChange'));
        }

        static genStateKey(directiveId, day) {
            return `${directiveId}${day}`;
        }

        static getDirectiveStates() {
                const stored = localStorage.getItem(this.STORAGE_KEY);
                return stored ? JSON.parse(stored) : {};
        }

        

static getCompletionStats() {
    const activeDirectives = this.getActiveDirectives();

    let completed = 0;
    let completedToday = 0;
    let total3 = 0;
    let completedLast3Days = [];

    // GET ALL DIRECTIVES COMPLETED IN LAST 3 DAYS
    const allDirectives = this.getDirectives();
    allDirectives.forEach(directive => {
        const states = this.getDirectiveStates();
            // CHECK IF DIRECTIVE WAS ACTIVE IN LAST 3 DAYS
            for (let i = 0; i < 3; i++) {
                const checkDate = new Date();
                checkDate.setDate(checkDate.getDate() - i);
                const checkDateStr = this.toLocalISOString(checkDate).split('T')[0];
                const stateKey = this.genStateKey(directive.id, checkDateStr);

                if (this.isDirectiveActiveToday(directive, checkDateStr)) {
                    total3++;

                    if (states[stateKey]) {
                        completed++;
                        if (i === 0) completedToday++;
                        completedLast3Days.push({
                        day: i,
                        directive: directive
                    });
                }

                    
                }
            }
    });

    // CALCULATE CURRENT STREAK
    let currentStreak = this.calculateCompletionStreak();

    const total = activeDirectives.length;

    return {
        completed,
        total,
        total3,
        percentage: total3 > 0 ? (completed / total3) * 100 : 0,
        percentageToday: total > 0 ? (completedToday / total) * 100 : 0,
        completedLast3Days: completedLast3Days,
        currentStreak: currentStreak // NEW STREAK VARIABLE
    };
}


static getStatsForDay(day) {
    const allDirectives = this.getDirectives();
    const states = this.getDirectiveStates();
    let total = 0, completed = [];

    allDirectives.forEach(directive => {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - day);
        const checkDateStr = this.toLocalISOString(checkDate).split('T')[0];
        const stateKey = this.genStateKey(directive.id, checkDateStr);

        if (this.isDirectiveActiveToday(directive, checkDateStr)) {
            total++;

             if (states[stateKey]) {
                completed.push({
                day: day,
                directive: directive
            });
        }

                    
        }
    });
}

static calculateCompletionStreak() {
    const states = this.getDirectiveStates();
    const today = this.toLocalISOString(new Date()).split('T')[0]; // YYYY-MM-DD FORMAT
    let streak = 0;

    // START FROM TODAY AND GO BACKWARDS
    for (let dayOffset = 0; dayOffset < 365; dayOffset++) { // MAX 1 YEAR LOOKBACK
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - dayOffset);
        const checkDateStr = this.toLocalISOString(checkDate).split('T')[0];

        // GET DIRECTIVES ACTIVE ON THIS DATE
        const activeOnDate = this.getDirectivesForDate(checkDateStr);

        if (activeOnDate.length === 0) {
            // NO DIRECTIVES ACTIVE ON THIS DATE, CONTINUE STREAK
            continue;
        }

        // COUNT COMPLETED DIRECTIVES ON THIS DATE
        let completedOnDate = 0;
        activeOnDate.forEach(directive => {
            const stateKey = this.genStateKey(directive.id, today);
            if (states[stateKey]) {
                completedOnDate++;
            }
        });

        // CHECK IF 50% OR MORE COMPLETED
        const completionRate = activeOnDate.length > 0 ? (completedOnDate / activeOnDate.length) : 0;

        if (completionRate >= 0.5) {
            streak++;
        } else {
            // STREAK BROKEN
            break;
        }
    }

    return streak;
}


        static getDirectives() {
                const stored = localStorage.getItem(this.DIRECTIVES_KEY);
                return stored ? JSON.parse(stored) : [];
        }


        static generateRecurringInstances() {

            const directives = this.getAllDirectives();
            const states = this.getDirectiveStates();
            const today = this.toLocalISOString(new Date()).split('T')[0]; // YYYY-MM-DD FORMAT

            directives.forEach(d => {
                if (d.recurring && this.isDirectiveActiveToday(d, today)) {
                    //Recurring and active today, search directives for existing instance
                    let instance = false;
                    directives.forEach(d2 => {
                        if (d2.template === d.id && (d2.startDate === today)) {
                            instance = true;
                            console.log("INSTNACE FOUND ")
                        }
                    });

                    if (!instance) {
                            console.log("INSTNACE NOT FOUND")
                        this.addDirective(d.text, d.tier, d.category, today, null, false, d.recurrencePattern, d.id);
                    }
                }
            });

        }

        static addDirective(text, tier, category, startDate, endDate, recurring, recurrencePattern, template) {
                const directives = this.getDirectives();
                const newDirective = {
                        id: Date.now(),
                        text: text.toUpperCase(),
                        tier: tier.toUpperCase(),
                        category: category.toUpperCase(),
                        startDate: startDate,
                        endDate: endDate || null,
                        recurring: recurring,
                        recurrencePattern: recurrencePattern,
                        dateAdded: new Date().toISOString(),
                        dateCompleted : null,
                        template: template //reference to parent recurring directive
                };
                
                directives.push(newDirective);
                localStorage.setItem(this.DIRECTIVES_KEY, JSON.stringify(directives));

                //if (recurring) this.generateRecurringInstances();
                this.loadDirectives();
        }

        static updateDirective(directiveId, text, tier, category, startDate, endDate, recurring, recurrencePattern) {
                const directives = this.getDirectives();
                
                const directiveIndex = directives.findIndex(d => {
                        return d.id === parseInt(directiveId); 
                });

                
                if (directiveIndex === -1) return;

                // UPDATE DIRECTIVE
                directives[directiveIndex] = {
                        ...directives[directiveIndex],
                        text: text.toUpperCase(),
                        tier: tier.toUpperCase(),
                        category: category.toUpperCase(),
                        startDate: startDate,
                        endDate: endDate || null,
                        recurring: false,
                        recurrencePattern: recurring ? recurrencePattern : null,
                        dateModified: new Date().toISOString()
                };
                localStorage.setItem(this.DIRECTIVES_KEY, JSON.stringify(directives));
                this.loadDirectives();



        }

        static removeDirective(directiveId) {
                const directives = this.getDirectives();
                const today = this.toLocalISOString(new Date()).split('T')[0]; // YYYY-MM-DD FORMAT
                console.log(directives); 


                
                // CLEAN UP STATES
                const states = this.getDirectiveStates();
                Object.keys(states).forEach(key => {
                        if (key.startsWith(this.genStateKey(directiveId, today))) {
                                delete states[key];
                        }
                });
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));


                let filtered = directives.filter(d => d.id != directiveId);
                localStorage.setItem(this.DIRECTIVES_KEY, JSON.stringify(filtered));
                
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