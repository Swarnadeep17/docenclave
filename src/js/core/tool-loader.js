class ToolLoader {
    constructor() {
        this.tools = new Map();
        this.categories = new Map();
    }

    async loadAllTools() {
        try {
            // For now, we'll define tools statically
            // Later this will scan the tools directory structure
            const toolConfigs = await this.getToolConfigs();
            
            const tools = [];
            for (const config of toolConfigs) {
                const tool = await this.loadToolConfig(config);
                if (tool) {
                    tools.push(tool);
                    this.tools.set(tool.id, tool);
                }
            }

            return tools;
        } catch (error) {
            console.error('Failed to load tools:', error);
            return [];
        }
    }

    async getToolConfigs() {
        // Static tool definitions for Phase 1
        // In Phase 2, this will dynamically scan the tools directory
        return [
            {
                path: 'src/tools/pdf/merge/tool-config.json',
                category: 'pdf'
            },
            {
                path: 'src/tools/pdf/split/tool-config.json',
                category: 'pdf'
            },
            {
                path: 'src/tools/pdf/compress/tool-config.json',
                category: 'pdf'
            }
        ];
    }

    async loadToolConfig(configPath) {
        try {
            // For Phase 1, we'll return mock data
            // Later this will fetch actual config files
            return this.getMockToolConfig(configPath);
        } catch (error) {
            console.error(`Failed to load tool config: ${configPath.path}`, error);
            return null;
        }
    }

    getMockToolConfig(configPath) {
        const mockConfigs = {
            'src/tools/pdf/merge/tool-config.json': {
                id: 'pdf-merge',
                name: 'PDF Merge',
                description: 'Combine multiple PDF files into one document',
                category: 'pdf',
                status: 'available',
                version: '1.0.0',
                icon: 'merge',
                features: {
                    free: {
                        description: 'Basic PDF merging',
                        limits: ['Up to 5 files', '20MB total size', 'Basic merge order']
                    },
                    premium: {
                        description: 'Advanced PDF merging',
                        limits: ['Unlimited files', '100MB total size', 'Custom page ranges', 'Bookmark preservation']
                    }
                },
                fileTypes: ['.pdf'],
                processingTime: 'Fast',
                privacy: 'Client-side only'
            },
            'src/tools/pdf/split/tool-config.json': {
                id: 'pdf-split',
                name: 'PDF Split',
                description: 'Split PDF files into separate pages or ranges',
                category: 'pdf',
                status: 'coming-soon',
                version: '1.0.0',
                icon: 'split',
                features: {
                    free: {
                        description: 'Basic PDF splitting',
                        limits: ['Split by pages', '20MB file size']
                    },
                    premium: {
                        description: 'Advanced PDF splitting',
                        limits: ['Split by ranges', '100MB file size', 'Batch processing']
                    }
                },
                fileTypes: ['.pdf']
            },
            'src/tools/pdf/compress/tool-config.json': {
                id: 'pdf-compress',
                name: 'PDF Compress',
                description: 'Reduce PDF file size while maintaining quality',
                category: 'pdf',
                status: 'coming-soon',
                version: '1.0.0',
                icon: 'compress',
                features: {
                    free: {
                        description: 'Basic compression',
                        limits: ['Standard compression', '20MB file size']
                    },
                    premium: {
                        description: 'Advanced compression',
                        limits: ['Custom compression levels', '100MB file size', 'Batch processing']
                    }
                },
                fileTypes: ['.pdf']
            }
        };

        return mockConfigs[configPath.path] || null;
    }

    async loadTool(toolId) {
        if (this.tools.has(toolId)) {
            return this.tools.get(toolId);
        }

        // Try to load tool dynamically
        try {
            const toolConfigs = await this.getToolConfigs();
            const config = toolConfigs.find(c => c.path.includes(toolId));
            if (config) {
                const tool = await this.loadToolConfig(config);
                if (tool) {
                    this.tools.set(tool.id, tool);
                    return tool;
                }
            }
        } catch (error) {
            console.error(`Failed to load tool: ${toolId}`, error);
        }

        return null;
    }

    getToolsByCategory(category) {
        const tools = [];
        for (const tool of this.tools.values()) {
            if (tool.category === category) {
                tools.push(tool);
            }
        }
        return tools;
    }

    getAvailableTools() {
        const tools = [];
        for (const tool of this.tools.values()) {
            if (tool.status === 'available') {
                tools.push(tool);
            }
        }
        return tools;
    }
}

// Initialize tool loader
window.toolLoader = new ToolLoader();