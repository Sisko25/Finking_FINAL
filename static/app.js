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

// Simple markdown parser
function parseMarkdown(text) {
    // Escape HTML to prevent XSS
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    let html = escapeHtml(text);

    // Code blocks (``````)
    html = html.replace(/``````/g, '<pre>de>$1</code></pre>');

    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, 'de>$1</code>');

    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Headings (### Heading)
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bullet lists (- item or * item)
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Numbered lists (1. item)
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    
    // Line breaks - Convert double newlines to paragraphs
    html = html.split('\n\n').map(para => {
        // Skip if already wrapped in a block element
        if (para.match(/^<(h[1-6]|ul|ol|pre|code)/)) {
            return para;
        }
        return `<p>${para.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
}

// Add message to chat with markdown support
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Render markdown for assistant messages
    if (role === 'assistant') {
        contentDiv.innerHTML = parseMarkdown(content);
    } else {
        contentDiv.textContent = content;
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message to backend with retry logic
async function sendMessage(userMessage, retryCount = 0) {
    const MAX_RETRIES = 2;
    
    try {
        // Disable input while processing
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        // Add user message to chat (only on first attempt)
        if (retryCount === 0) {
            addMessage('user', userMessage);
        }
        
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message typing-indicator';
        typingDiv.innerHTML = '<div class="message-content"><span></span><span></span><span></span></div>';
        typingDiv.id = 'typing-indicator';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Send request to backend with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Remove typing indicator
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // Handle 503 Service Unavailable (Render cold start)
        if (response.status === 503) {
            if (retryCount < MAX_RETRIES) {
                console.log(`Service unavailable, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
                return await sendMessage(userMessage, retryCount + 1);
            } else {
                throw new Error('Service is currently starting up. Please wait a moment and try again.');
            }
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data); // Debug log
        
        // Add assistant response
        if (data.reply) {
            addMessage('assistant', data.reply);
        } else if (data.error) {
            addMessage('assistant', `⚠️ ${data.error}`);
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
        
        // Better error messages
        if (error.name === 'AbortError') {
            addMessage('assistant', "⏱️ Request timed out. The AI is taking too long to respond. Please try a simpler question.");
        } else if (error.message.includes('Service is currently starting up')) {
            addMessage('assistant', "🔄 " + error.message);
        } else {
            addMessage('assistant', "❌ Sorry, I'm having trouble connecting to the server. Please try again in a moment.");
        }
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
