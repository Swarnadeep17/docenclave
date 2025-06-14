export class StatsTracker {
    constructor() {
        this.stats = {
            visits: 0,
            processedFiles: 0
        };
    }

    async init() {
        await this.loadStats();
        this.updateUI();
        this.startTracking();
    }

    updateUI() {
        // Update statistics display
    }
}