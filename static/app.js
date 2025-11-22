// Application State
const state = {
    currentPage: 'chat',
    messages: [],
    isLoading: false
};

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

// Initialize Application
function init() {
    setupEventListeners();
    displayWelcomeMessage();
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Send Message
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
}

// Navigation
function navigateToPage(pageName) {
    // Update state
    state.currentPage = pageName;
    
    // Update nav buttons
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-page') === pageName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update pages
    pages.forEach(page => {
        if (page.id === `${pageName}-page`) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
}

// Display Welcome Message
function displayWelcomeMessage() {
    const welcomeMessage = {
        role: 'assistant',
        content: "Welcome to FinKing AI! 👋 I'm your AI investment analyst at Sisko Capital. Ask me anything about markets, stocks, crypto, or investment strategies!"
    };
    
    state.messages.push(welcomeMessage);
    renderMessage(welcomeMessage);
}

// Handle Send Message
async function handleSendMessage() {
    const message = messageInput.value.trim();
    
    if (!message || state.isLoading) {
        return;
    }
    
    // Clear input
    messageInput.value = '';
    
    // Add user message
    const userMessage = {
        role: 'user',
        content: message
    };
    
    state.messages.push(userMessage);
    renderMessage(userMessage);
    
    // Show loading
    state.isLoading = true;
    updateSendButtonState();
    showLoadingMessage();
    
    // Call API
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                history: state.messages.filter(m => m.role !== 'loading')
            })
        });
        
        // Remove loading message
        removeLoadingMessage();
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // FIXED: Check for 'reply' first (what backend actually returns), then fallback to others
        const assistantMessage = {
            role: 'assistant',
            content: data.reply || data.response || data.message || 'I apologize, but I received an empty response. Please try again.'
        };
        
        state.messages.push(assistantMessage);
        renderMessage(assistantMessage);
        
    } catch (error) {
        console.error('API Error:', error);
        
        // Remove loading message
        removeLoadingMessage();
        
        // Show error message
        const errorMessage = {
            role: 'assistant',
            content: '⚠️ I apologize, but I\'m having trouble connecting to the server. This could be because the API endpoint is not configured yet. Please ensure the backend API is running at /api/chat.'
        };
        
        state.messages.push(errorMessage);
        renderMessage(errorMessage);
    } finally {
        state.isLoading = false;
        updateSendButtonState();
    }
}

// Render Message
function renderMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', message.role);
    
    if (message.role === 'loading') {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        `;
    } else {
        const avatar = message.role === 'user' ? '👤' : '🤖';
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">${escapeHtml(message.content)}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Show Loading Message
function showLoadingMessage() {
    const loadingMessage = {
        role: 'loading',
        content: ''
    };
    
    renderMessage(loadingMessage);
}

// Remove Loading Message
function removeLoadingMessage() {
    const loadingMessages = chatMessages.querySelectorAll('.message.loading');
    loadingMessages.forEach(msg => msg.remove());
}

// Update Send Button State
function updateSendButtonState() {
    sendButton.disabled = state.isLoading;
}

// Scroll to Bottom
function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
