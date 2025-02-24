//import PongGame3D from './game3d.js';

export class GameManager {
    constructor() {
        this.game = null;
        this.bindEventListeners();
    }

    bindEventListeners() {
        // Game controls
        document.getElementById('quickMatch').addEventListener('click', () => this.handleQuickMatch());
        document.getElementById('createCustom').addEventListener('click', () => this.showCustomGameModal());
        document.getElementById('practiceAI').addEventListener('click', () => this.handlePracticeMode());

        // Custom game modal
        document.getElementById('cancelCustomGame').addEventListener('click', () => this.hideCustomGameModal());
        document.getElementById('createGameBtn').addEventListener('click', () => this.handleCustomGameSubmit());

        // Chat handling
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendChat');
        
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
        sendButton?.addEventListener('click', () => this.sendChatMessage());
    }

    handleQuickMatch() {
        this.updateGameStatus('Finding opponent...');
        // Here you would integrate with your matchmaking system
        setTimeout(() => {
            this.loadGameUI('Quick Match');
        }, 2000);
    }

    handlePracticeMode() {
        this.updateGameStatus('Starting AI practice game...');
        setTimeout(() => {
            this.loadGameUI('Practice');
        }, 1000);
    }

    showCustomGameModal() {
        const modal = document.getElementById('customGameModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideCustomGameModal() {
        const modal = document.getElementById('customGameModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async handleCustomGameSubmit() {
        const gameOptions = {
            mode: document.getElementById('gameMode').value,
            scoreLimit: parseInt(document.getElementById('scoreLimit').value),
            ballSpeed: document.getElementById('ballSpeed').value,
            visibility: document.getElementById('visibility').value
        };

        try {
            const response = await this.apiClient.createCustomGame(gameOptions);
            this.hideCustomGameModal();
            
            if (response.gameId) {
                this.loadGameUI('Custom', gameOptions);
            }
        } catch (error) {
            console.error('Failed to create custom game:', error);
            // Handle error (show message to user)
        }
    }

    loadGameUI(type, settings = {}) {
        // Clear any existing game
        if (this.game) {
            // Cleanup existing game if needed
            this.game = null;
        }

        // Hide the game modes section
        const gameModes = document.querySelector('.game-modes');
        if (gameModes) {
            gameModes.style.display = 'none';
        }

        // Show the game container
        const gameContainer = document.querySelector('.game-canvas-container');
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }

        // Initialize 3D game
        this.game = new Game3DRenderer('game3D');
        this.game.startGame(type);

        // Update game status
        this.updateGameStatus('Game in progress');
        this.updateGameType(type);
    }

    updateGameStatus(status) {
        const statusElement = document.getElementById('gameStatus');
        const overlayStatus = document.querySelector('.game-status');
        
        if (statusElement) {
            statusElement.textContent = status;
        }
        if (overlayStatus) {
            overlayStatus.textContent = status;
        }
    }

    updateGameType(type) {
        const typeElement = document.getElementById('gameType');
        if (typeElement) {
            typeElement.textContent = type;
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input?.value.trim();
        
        if (message) {
            const chatMessages = document.getElementById('gameChatMessages');
            if (chatMessages) {
                const messageElement = document.createElement('div');
                messageElement.textContent = `You: ${message}`;
                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                input.value = '';
            }
        }
    }
}

// Initialize game manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});
