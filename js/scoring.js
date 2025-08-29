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

        console.log("yo")
        console.log(directiveStats);

        const score = this.calculateScore();

        
        return {

            mainColor: this.calculateMainColorVertex(directiveStats),
            centerColor: this.calculateCenterColorVertex(directiveStats),

            color1: this.calculateColorVertex(0),
            color2: this.calculateColorVertex(1),
            color3: this.calculateColorVertex(2),

            normScore: score/150.0,
            percentage: directiveStats.percentage,
            delta: this.calculateRotationVertex(),
            tierVariety: this.calculateTierVariety(),

            ringCount: this.calculateRingCountVertex(journalStats, directiveStats)
        };
    }

    static calculateMainColorVertex(d) {
        let color = {};
        let score = d.percentage/100.0;

        if (demoState === true) {
            score = document.getElementById('3day_percent').value/100.0;
        }

        if (score < 0.14) {
            let pct = score/0.14;
            color.red = 255.0*Math.pow(1.0-pct, 2.0);
            color.green = 255.0*(1.0-pct);
            color.blue = 255.0;
        } else if (score < 0.3) {
            let pct = (score-0.14)/(0.3-0.14);
            color.red = 0.0;
            color.green = 255.0*(pct);
            color.blue = 255.0;
        } else if (score < 0.5) {
            let pct = (score-0.3)/(0.5-0.3);
            color.red = 255*Math.sqrt(pct);
            color.green = 255*(1.0-pct);
            color.blue = 255.0;
        } else if (score < 0.8) {
            let pct = (score - 0.5)/(0.8-0.5);
            color.red = 255.0;
            color.green = 200.0*pct;
            color.blue = 255*(1.0-pct);
        } else {
            let pct = (score - 0.8)/(1.0-0.8);
            color.red = 255.0;
            color.green = 200.0 - 100.0*(pct);
            color.blue = 0.0;
        }

        
        return color;
    }


    static calculateCenterColorVertex(d) {
        let color = {};
        let score = d.percentageToday/100.0;


        if (demoState === true) {
            score = document.getElementById('today_percent').value/100.0;
        }

        if (score < 0.14) {
            let pct = score/0.14;
            color.red = 255.0*Math.pow(1.0-pct, 2.0);
            color.green = 255.0*(1.0-pct);
            color.blue = 255.0;
        } else if (score < 0.3) {
            let pct = (score-0.14)/(0.3-0.14);
            color.red = 0.0;
            color.green = 255.0*(pct);
            color.blue = 255.0;
        } else if (score < 0.5) {
            let pct = (score-0.3)/(0.5-0.3);
            color.red = 255*Math.sqrt(pct);
            color.green = 255*(1.0-pct);
            color.blue = 255.0;
        } else if (score < 0.8) {
            let pct = (score - 0.5)/(0.8-0.5);
            color.red = 255.0;
            color.green = 200.0*pct;
            color.blue = 255*(1.0-pct);
        } else {
            let pct = (score - 0.8)/(1.0-0.8);
            color.red = 255.0;
            color.green = 200.0 - 100.0*(pct);
            color.blue = 0.0;
        }
        
        return color;
    }


    static calculateColorVertex(i) {
        let color = {};
        let score = this.calculateScoreForDay(i);

        if (score < 15) {
            let pct = score/15.0;
            color.red = 255.0;
            color.green = 50.0 + 100.0*pct;
            color.blue = 0.0;
        } else if (score < 25) {
            let pct = (score-15)/(25-15);
            color.red = 255.0;
            color.green = 204 + 34*pct;
            color.blue = 136.0*pct;
        } else if (score < 40) {
            let pct = (score - 25)/(40-25);
            color.red = 102;
            color.green = 204.0;
            color.blue = 102 + 153*pct;
        } else {
            let pct = (score - 40)/(50-40);
            color.red = 204 + 51*pct;
            color.green = 204 + 51*pct;
            color.blue = 255;
        }


         if (score < 7) {
            let pct = score/7.0;
            color.red = 255.0*Math.pow(1.0-pct, 2.0);
            color.green = 255.0*(1.0-pct);
            color.blue = 255.0;
        } else if (score < 15) {
            let pct = (score-7.0)/(15.0-7.0);
            color.red = 0.0;
            color.green = 255.0*(pct);
            color.blue = 255.0;
        } else if (score < 25) {
            let pct = (score-15)/(25-15);
            color.red = 255*Math.sqrt(pct);
            color.green = 255*(1.0-pct);
            color.blue = 255.0;
        } else if (score < 40) {
            let pct = (score - 25)/(40-25);
            color.red = 255.0;
            color.green = 200.0*pct;
            color.blue = 255*(1.0-pct);
        } else {
            let pct = (score - 40)/(50-40);
            color.red = 255.0;
            color.green = 200.0 - 100.0*(pct);
            color.blue = 0.0;
        }
        
        return color;
    }

    static calculateColorRatioVertex(journalStats) {
        // BASED ON JOURNAL LENGTH
        let score = 0;
        if (journalStats.avgWordCount >= 50) score += 0.3;
        if (journalStats.avgWordCount >= 100) score += 0.35;
        if (journalStats.avgWordCount >= 200) score += 0.35;
        return Math.min(1.0, score);
    }

    static calculateSizeVertex(score) {
        // BASED ON DIRECTIVE COMPLETION
        return 0.2 + score/150.0*0.5;
    }

    static calculateRotationVertex() {
        let score0 = this.calculateScoreForDay(0);
        let score1 = this.calculateScoreForDay(1);
        let score2 = this.calculateScoreForDay(2);

        let diff = (score0 - score1) + (score1 - score2)*0.5;

        return diff;
    }

    static calculateTierVariety() {

        const directiveStats = DirectiveManager.getCompletionStats();
            console.log("Complexity");
            console.log(directiveStats);
        let t1 = false;
        let t2 = false;
        let t3 = false;
        directiveStats.completedLast3Days.forEach(d => {
            if (d.directive.tier === "TIER 1") t1 = true;
             else if (d.directive.tier === "TIER 2") t2 = true;
            else if (d.directive.tier === "TIER 3") t3 = true;
        });
        let complexity = 0.0;

        if (t1) complexity += 1.0/3.0;
        if (t2) complexity += 1.0/3.0;
        if (t3) complexity += 1.0/3.0;

        if (demoState === true) {
            complexity = document.getElementById('tier_variety').value/3.0;
        }

        return complexity;
    }

    static calculateRingCountVertex(journalStats, directiveStats) {
        // BASED ON OVERALL ENGAGEMENT
        const journalScore = (journalStats.todayCount > 0 ? 0.3 : 0) + 
                           (journalStats.weekCount >= 3 ? 0.2 : 0);
        const directiveScore = directiveStats.percentage / 100 * 0.5;
        
        return Math.min(1.0, journalScore + directiveScore);
    }

    static calculateScore() {
        let score = this.calculate3DayScore();
        return score;
    }

    static calculate3DayScore() {
        let score = 0;
        for (var i = 0; i < 3; i++) {
            score += this.calculateScoreForDay(i);
        }

        if (demoState === true) {
            score = document.getElementById('score').value/100.0*150.0;
        }

        return score;
    }

    static calculateScoreForDay(i) {
        const directiveStats = DirectiveManager.getCompletionStats();
        let score = 0;
        directiveStats.completedLast3Days.forEach(d => {
            console.log(d.directive.tier);
            if (d.day === i) {
                if (d.directive.tier === "TIER 1") score += 10;
                else if (d.directive.tier === "TIER 2") score += 6;
                else if (d.directive.tier === "TIER 3") score += 3;
            }
        });
        //console.log("SCORE : " + score);


        return score;
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