class ScoreCalculator {
    static WEIGHTS = {
        JOURNAL_FREQUENCY: 30,
        JOURNAL_LENGTH: 20,
        DIRECTIVE_COMPLETION: 35,
        CONSISTENCY: 15
    };

    static calculateVertices() {
        const journalStats = JournalManager.getEntryStats();
        const directiveStats = DirectiveManager.getCompletionStats();
        
        return {
            color: this.calculateColorVertex(journalStats),
            colorRatio: this.calculateColorRatioVertex(journalStats),
            size: this.calculateSizeVertex(directiveStats),
            rotation: this.calculateRotationVertex(journalStats),
            ringCount: this.calculateRingCountVertex(journalStats, directiveStats)
        };
    }

    static calculateColorVertex(journalStats) {
        // BASED ON JOURNAL FREQUENCY
        let score = 0;
        if (journalStats.todayCount > 0) score += 0.4;
        if (journalStats.weekCount >= 3) score += 0.3;
        if (journalStats.weekCount >= 7) score += 0.3;
        return Math.min(1.0, score);
    }

    static calculateColorRatioVertex(journalStats) {
        // BASED ON JOURNAL LENGTH
        let score = 0;
        if (journalStats.avgWordCount >= 50) score += 0.3;
        if (journalStats.avgWordCount >= 100) score += 0.35;
        if (journalStats.avgWordCount >= 200) score += 0.35;
        return Math.min(1.0, score);
    }

    static calculateSizeVertex(directiveStats) {
        // BASED ON DIRECTIVE COMPLETION
        return directiveStats.percentage / 100;
    }

    static calculateRotationVertex(journalStats) {
        // BASED ON CONSISTENCY
        if (!journalStats.lastEntry) return 0;
        
        const daysSinceLastEntry = Math.floor(
            (new Date() - journalStats.lastEntry) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastEntry === 0) return 1.0;
        if (daysSinceLastEntry === 1) return 0.8;
        if (daysSinceLastEntry <= 3) return 0.6;
        if (daysSinceLastEntry <= 7) return 0.4;
        return 0.2;
    }

    static calculateRingCountVertex(journalStats, directiveStats) {
        // BASED ON OVERALL ENGAGEMENT
        const journalScore = (journalStats.todayCount > 0 ? 0.3 : 0) + 
                           (journalStats.weekCount >= 3 ? 0.2 : 0);
        const directiveScore = directiveStats.percentage / 100 * 0.5;
        
        return Math.min(1.0, journalScore + directiveScore);
    }

    static calculateScore() {
        // LEGACY SINGLE SCORE FOR DISPLAY
        const vertices = this.calculateVertices();
        return Math.round((vertices.color + vertices.colorRatio + vertices.size + vertices.rotation + vertices.ringCount) * 20);
    }

    static getVertexBreakdown() {
        const vertices = this.calculateVertices();
        return {
            vertices: vertices,
            mappings: {
                color: 'JOURNAL FREQUENCY',
                colorRatio: 'JOURNAL LENGTH', 
                size: 'DIRECTIVE COMPLETION',
                rotation: 'CONSISTENCY',
                ringCount: 'OVERALL ENGAGEMENT'
            },
            legacyScore: this.calculateScore()
        };
    }
}