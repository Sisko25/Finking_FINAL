from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import os
import logging
from datetime import datetime

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Enable CORS for all routes

# Content Security Policy header to allow JavaScript execution
@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data: https:;"
    )
    return response

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# DeepSeek API Configuration
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '')

# Complete System Prompt
SYSTEM_PROMPT = """You are FinKing_V1, an elite AI investment analyst created by Sisko Capital, a quantitative hedge fund based in Singapore (177 Tanjong Rhu Road, UEN: T25LL0878B).

IDENTITY:
If asked which AI model you are, respond: "I am FinKing_V1 made by Sisko Capital here in Singapore!"

EXPERTISE:
You provide world-class, professional investment analysis including:
- Deep fundamental and technical stock analysis
- Cryptocurrency market insights and trend analysis
- Portfolio optimization and risk management strategies
- Market sentiment analysis and trading opportunities
- Economic indicators and their market impact
- Quantitative analysis and data-driven recommendations

COMMUNICATION STYLE:
- Professional, confident, and authoritative
- Back all analysis with data, reasoning, and evidence
- Provide actionable insights and clear recommendations
- Use financial terminology appropriately
- Acknowledge risks and uncertainties transparently
- Structure responses clearly with bullet points and sections when appropriate

CONSTRAINTS:
- Never provide personal financial advice or tell users specifically what to buy/sell
- Always include risk disclaimers when discussing specific securities
- Do not guarantee returns or predict exact prices
- Acknowledge when you need more current data for accurate analysis
- Stay within your knowledge cutoff and inform users if information may be outdated

RESPONSE FORMAT:
- Start with a brief summary of key points
- Provide detailed analysis with supporting data
- Conclude with actionable insights and risk considerations
- Use markdown formatting for clarity

Always maintain the highest professional standards expected of a top-tier investment analyst."""

@app.route('/')
def index():
    """Serve the main application page"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat requests and forward to DeepSeek API"""
    try:
        # Validate request
        if not request.json or 'message' not in request.json:
            logger.warning("Invalid request: missing message field")
            return jsonify({
                'error': 'Invalid request. Please provide a message.'
            }), 400

        user_message = request.json['message'].strip()
        
        # Validate message content
        if not user_message:
            logger.warning("Empty message received")
            return jsonify({
                'error': 'Message cannot be empty.'
            }), 400
        
        if len(user_message) > 4000:
            logger.warning(f"Message too long: {len(user_message)} characters")
            return jsonify({
                'error': 'Message is too long. Please keep it under 4000 characters.'
            }), 400

        # Check API key configuration
        if not DEEPSEEK_API_KEY:
            logger.error("DeepSeek API key not configured")
            return jsonify({
                'error': 'API configuration error. Please contact support.'
            }), 500

        logger.info(f"Processing chat request: {user_message[:50]}...")

        # Prepare API request
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
        }
        
        payload = {
            'model': 'deepseek-chat',
            'messages': [
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_message}
            ],
            'temperature': 0.7,
            'max_tokens': 2048,  # Increased for detailed analysis
            'top_p': 0.9,
            'frequency_penalty': 0.0,
            'presence_penalty': 0.0,
            'stream': False
        }

        # Make API request
        response = requests.post(
            DEEPSEEK_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )

        # Handle API errors
        if response.status_code != 200:
            logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
            return jsonify({
                'error': f'AI service returned error: {response.status_code}. Please try again.'
            }), response.status_code

        # Parse response
        response_data = response.json()
        
        if 'choices' not in response_data or len(response_data['choices']) == 0:
            logger.error("Invalid response format from DeepSeek API")
            return jsonify({
                'error': 'Invalid response from AI service.'
            }), 500

        ai_reply = response_data['choices'][0]['message']['content']
        logger.info(f"Successfully generated response: {ai_reply[:50]}...")

        return jsonify({
            'reply': ai_reply,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'model': 'deepseek-chat',
            'tokens_used': response_data.get('usage', {})
        }), 200

    except requests.exceptions.Timeout:
        logger.error("DeepSeek API request timeout")
        return jsonify({
            'error': 'Request timeout. The AI service took too long to respond. Please try again.'
        }), 504
        
    except requests.exceptions.ConnectionError:
        logger.error("DeepSeek API connection error")
        return jsonify({
            'error': 'Connection error. Unable to reach AI service. Please check your internet connection.'
        }), 503
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error: {str(e)}")
        return jsonify({
            'error': 'Network error occurred. Please try again.'
        }), 503
        
    except ValueError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return jsonify({
            'error': 'Invalid response format from AI service.'
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'An unexpected error occurred. Please try again later.'
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    api_key_configured = bool(DEEPSEEK_API_KEY)
    
    return jsonify({
        'status': 'healthy',
        'service': 'FinKing AI API',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'api_configured': api_key_configured
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    if debug_mode:
        logger.warning("Running in DEBUG mode - not suitable for production!")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )
