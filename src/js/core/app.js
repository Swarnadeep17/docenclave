class DocEnclaveApp {
    constructor() {
        this.currentTool = null;
        this.sessionUsage = 0; // Track session file size usage
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showError('Failed to initialize application');
        }
    }

    async initializeApp() {
        try {
            // Initialize components
            await this.loadStats();
            await this.loadTools();
            this.setupEventListeners();
            this.hideLoadingScreen();
            
            console.log('DocEnclave initialized successfully');
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError('Application failed to load');
        }
    }

    setupEventListeners() {
        // Auth button
        const authBtn = document.getElementById('auth-btn');
        if (authBtn) {
            authBtn.addEventListener('click', () => this.showAuthModal());
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Close auth modal
        const closeAuthModal = document.getElementById('close-auth-modal');
        if (closeAuthModal) {
            closeAuthModal.addEventListener('click', () => this.hideAuthModal());
        }

        // Back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showToolsSection());
        }

        // Modal backdrop click
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) {
                    this.hideAuthModal();
                }
            });
        }

        // Handle browser back button
        window.addEventListener('popstate', (e) => {
            if (this.currentTool) {
                this.showToolsSection();
            }
        });
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContent = document.getElementById('main-content');
        
        if (loadingScreen && mainContent) {
            loadingScreen.style.display = 'none';
            mainContent.style.display = 'block';
        }
    }

    async loadStats() {
        try {
            const stats = await window.statsManager.getStats();
            this.updateStatsDisplay(stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        const monthlyVisits = document.getElementById('monthly-visits');
        const monthlyDownloads = document.getElementById('monthly-downloads');

        if (monthlyVisits) {
            this.animateNumber(monthlyVisits, stats.monthlyVisits || 0);
        }
        if (monthlyDownloads) {
            this.animateNumber(monthlyDownloads, stats.monthlyDownloads || 0);
        }
    }

    animateNumber(element, targetValue) {
        const duration = 2000;
        const startValue = 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = this.formatNumber(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    async loadTools() {
        try {
            const tools = await window.toolLoader.loadAllTools();
            this.renderToolsGrid(tools);
        } catch (error) {
            console.error('Failed to load tools:', error);
            this.showError('Failed to load tools');
        }
    }

    renderToolsGrid(tools) {
        const container = document.getElementById('tools-container');
        if (!container) return;

        // Group tools by category
        const categories = {};
        tools.forEach(tool => {
            if (!categories[tool.category]) {
                categories[tool.category] = [];
            }
            categories[tool.category].push(tool);
        });

        // Render categories
        container.innerHTML = '';
        Object.entries(categories).forEach(([category, categoryTools]) => {
            const categoryElement = this.createCategoryElement(category, categoryTools);
            container.appendChild(categoryElement);
        });
    }

    createCategoryElement(category, tools) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'tool-category';
        categoryDiv.innerHTML = `
            <div class="category-header" data-category="${category}">
                <h3>${category.toUpperCase()}</h3>
                <span class="category-count">${tools.length} tools</span>
                <span class="expand-icon">▼</span>
            </div>
            <div class="category-tools" style="display: none;">
                ${tools.map(tool => this.createToolElement(tool)).join('')}
            </div>
        `;

        // Add click handler for category expansion
        const header = categoryDiv.querySelector('.category-header');
        header.addEventListener('click', () => this.toggleCategory(categoryDiv));

        return categoryDiv;
    }

    createToolElement(tool) {
        const statusClass = tool.status === 'available' ? 'available' : 'coming-soon';
        const isClickable = tool.status === 'available';
        
        return `
            <div class="tool-card ${statusClass}" ${isClickable ? `data-tool="${tool.id}"` : ''}>
                <div class="tool-icon">
                    <span class="icon">${this.getToolIcon(tool.icon)}</span>
                </div>
                <div class="tool-info">
                    <h4>${tool.name}</h4>
                    <p>${tool.description}</p>
                    ${tool.status === 'coming-soon' ? '<span class="status-badge">Coming Soon</span>' : ''}
                </div>
                <div class="tool-stats">
                    <span class="usage-count" id="usage-${tool.id}">0 uses</span>
                </div>
            </div>
        `;
    }

    getToolIcon(iconName) {
        const icons = {
            merge: '📄',
            split: '✂️',
            compress: '🗜️',
            convert: '🔄',
            edit: '✏️',
            protect: '🔒'
        };
        return icons[iconName] || '📄';
    }

    toggleCategory(categoryElement) {
        const toolsContainer = categoryElement.querySelector('.category-tools');
        const expandIcon = categoryElement.querySelector('.expand-icon');
        const isExpanded = toolsContainer.style.display !== 'none';

        if (isExpanded) {
            toolsContainer.style.display = 'none';
            expandIcon.textContent = '▼';
            categoryElement.classList.remove('expanded');
        } else {
            toolsContainer.style.display = 'grid';
            expandIcon.textContent = '▲';
            categoryElement.classList.add('expanded');
            
            // Add click handlers for available tools
            const toolCards = toolsContainer.querySelectorAll('.tool-card.available');
            toolCards.forEach(card => {
                card.addEventListener('click', () => {
                    const toolId = card.dataset.tool;
                    this.openTool(toolId);
                });
            });

            // Load usage stats for visible tools
            this.loadToolUsageStats(categoryElement);
        }
    }

    async loadToolUsageStats(categoryElement) {
        const toolCards = categoryElement.querySelectorAll('.tool-card[data-tool]');
        toolCards.forEach(async (card) => {
            const toolId = card.dataset.tool;
            const usageElement = card.querySelector(`#usage-${toolId}`);
            if (usageElement) {
                try {
                    const usage = await window.statsManager.getToolUsage(toolId);
                    usageElement.textContent = `${this.formatNumber(usage)} uses`;
                } catch (error) {
                    console.error(`Failed to load usage for ${toolId}:`, error);
                }
            }
        });
    }

    async openTool(toolId) {
        try {
            const tool = await window.toolLoader.loadTool(toolId);
            if (tool) {
                this.currentTool = tool;
                await this.showToolInterface(tool);
                
                // Track tool access
                window.statsManager.trackToolAccess(toolId);
                
                // Update URL without page reload
                history.pushState({ tool: toolId }, '', `#${toolId}`);
            }
        } catch (error) {
            console.error('Failed to open tool:', error);
            this.showError('Failed to load tool');
        }
    }

    async showToolInterface(tool) {
        const toolsSection = document.querySelector('.tools-section');
        const toolInterface = document.getElementById('tool-interface');
        const toolTitle = document.getElementById('tool-title');
        const toolContent = document.getElementById('tool-content');

        if (toolsSection && toolInterface && toolTitle && toolContent) {
            // Hide tools section
            toolsSection.style.display = 'none';
            
            // Show tool interface
            toolInterface.style.display = 'block';
            toolTitle.textContent = tool.name;
            
            // Load tool content
            try {
                const toolHTML = await this.loadToolHTML(tool);
                toolContent.innerHTML = toolHTML;
                
                // Initialize tool functionality
                await this.initializeTool(tool);
            } catch (error) {
                console.error('Failed to load tool interface:', error);
                toolContent.innerHTML = '<p>Failed to load tool interface</p>';
            }
        }
    }

    async loadToolHTML(tool) {
        // For now, return a basic template
        // Later we'll load actual tool HTML files
        return `
            <div class="tool-workspace">
                <div class="file-upload-area">
                    <div class="upload-zone" id="upload-zone-${tool.id}">
                        <div class="upload-icon">📁</div>
                        <h3>Drop your files here</h3>
                        <p>or click to browse</p>
                        <input type="file" id="file-input-${tool.id}" multiple accept="${tool.fileTypes?.join(',') || '*'}" style="display: none;">
                    </div>
                </div>
                <div class="tool-controls" id="tool-controls-${tool.id}" style="display: none;">
                    <!-- Tool-specific controls will be added here -->
                </div>
                <div class="processing-area" id="processing-area-${tool.id}" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill-${tool.id}"></div>
                    </div>
                    <p id="processing-status-${tool.id}">Processing...</p>
                </div>
            </div>
        `;
    }

    async initializeTool(tool) {
        // Initialize file upload for the tool
        const uploadZone = document.getElementById(`upload-zone-${tool.id}`);
        const fileInput = document.getElementById(`file-input-${tool.id}`);

        if (uploadZone && fileInput) {
            // Click to upload
            uploadZone.addEventListener('click', () => fileInput.click());

            // Drag and drop
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('drag-over');
            });

            uploadZone.addEventListener('dragleave', () => {
                uploadZone.classList.remove('drag-over');
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
                this.handleFileUpload(e.dataTransfer.files, tool);
            });

            // File input change
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files, tool);
            });
        }
    }

    handleFileUpload(files, tool) {
        const fileArray = Array.from(files);
        
        // Validate files
        const validation = this.validateFiles(fileArray, tool);
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }

        // Process files based on tool type
        this.processFiles(fileArray, tool);
    }

    validateFiles(files, tool) {
        const userPlan = window.currentUser?.plan || 'free';
        const maxSize = window.appConfig.maxFileSize[userPlan];
        
        let totalSize = 0;
        for (const file of files) {
            totalSize += file.size;
        }

        // Check session usage + new files
        if (this.sessionUsage + totalSize > maxSize) {
            return {
                valid: false,
                message: