// FinKing AI - Chat Functionality
// API endpoint for backend
const API_URL = '/api/chat';

// DOM elements
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const sendButton = document.getElementById('send-button');

// Initialize chat
function initChat() {
    // Add welcome message
    addMessage('assistant', "Hello! I'm FinKing AI, your AI-powered investment analyst. Ask me about stocks, crypto, markets, or any financial questions you have!");
}

// Add message to chat
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message to backend
async function sendMessage(userMessage) {
    try {
        // Disable input while processing
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        // Add user message to chat
        addMessage('user', userMessage);
        
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message typing-indicator';
        typingDiv.innerHTML = '<div class="message-content"><span></span><span></span><span></span></div>';
        typingDiv.id = 'typing-indicator';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Send request to backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });
        
        // Remove typing indicator
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data); // Debug log
        
        // Add assistant response - FIXED: Changed from data.response to data.reply
        if (data.reply) {
            addMessage('assistant', data.reply);
        } else if (data.error) {
            addMessage('assistant', data.error);
        } else {
            addMessage('assistant', 'Sorry, I encountered an error processing your request.');
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove typing indicator if it exists
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        addMessage('assistant', "Sorry, I'm having trouble connecting to the server. Please try again later.");
    } finally {
        // Re-enable input
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Handle form submission
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message) return;
        
        // Clear input
        messageInput.value = '';
        
        // Send message
        await sendMessage(message);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
} else {
    initChat();
}
