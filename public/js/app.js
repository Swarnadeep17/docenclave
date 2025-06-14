import { ToolsManager } from './tools-manager.js';
import { StatsTracker } from './stats-tracker.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const toolsManager = new ToolsManager();
    const statsTracker = new StatsTracker();

    // Start the application
    toolsManager.init();
    statsTracker.init();
});