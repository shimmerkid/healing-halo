class DirectiveManager {
    static STORAGE_KEY = 'directiveStates';
    static DIRECTIVES_KEY = 'adminDirectives';

    static init() {
        this.directivesList = document.getElementById('directivesList');
        this.loadDirectives();
    }

    static loadDirectives() {
        const directives = this.getDirectives();
        const states = this.getDirectiveStates();
        this.directivesList.innerHTML = '';

        if (directives.length === 0) {
            this.directivesList.innerHTML = '<div class="text-gray-400 text-center p-4">NO DIRECTIVES AVAILABLE<br>WAITING FOR ADMIN INPUT</div>';
            return;
        }

        directives.forEach(directive => {
            const isCompleted = states[directive.id] || false;
            
            const directiveEl = document.createElement('div');
            directiveEl.className = 'flex items-center p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors';
            
            directiveEl.innerHTML = `
                <input 
                    type="checkbox" 
                    class="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    ${isCompleted ? 'checked' : ''}
                    data-directive-id="${directive.id}"
                >
                <div class="flex-1">
                    <div class="text-white ${isCompleted ? 'line-through opacity-60' : ''}">${directive.text}</div>
                    <div class="text-xs text-gray-400">${directive.category}</div>
                </div>
            `;

            const checkbox = directiveEl.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                this.toggleDirective(directive.id, e.target.checked);
            });

            this.directivesList.appendChild(directiveEl);
        });
    }

    static toggleDirective(directiveId, completed) {
        const states = this.getDirectiveStates();
        states[directiveId] = completed;
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
        const directives = this.getDirectives();
        const states = this.getDirectiveStates();
        const completed = Object.values(states).filter(Boolean).length;
        const total = directives.length;
        
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

    static addDirective(text, category = 'GENERAL') {
        const directives = this.getDirectives();
        const newDirective = {
            id: Date.now(),
            text: text.toUpperCase(),
            category: category.toUpperCase(),
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
        delete states[directiveId];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
        
        this.loadDirectives();
    }

    static resetDirectives() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.loadDirectives();
        document.dispatchEvent(new CustomEvent('dataChange'));
    }
}