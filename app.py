from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import newsapi
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize News API
try:
    with open("news_api_key.txt", 'r') as api_file:
        MY_API_KEY = api_file.readline().strip()
    news_api = newsapi.NewsApiClient(api_key=MY_API_KEY)
except FileNotFoundError:
    # Fallback
    MY_API_KEY = os.getenv('NEWS_API_KEY', '')
    if MY_API_KEY:
        news_api = newsapi.NewsApiClient(api_key=MY_API_KEY)
    else:
        print("Warning: No API key found. Please create 'news_api_key.txt' or set NEWS_API_KEY environment variable.")
        news_api = None


@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')


@app.route('/api/search', methods=['POST'])
def search_news():
    """
    Search for news articles based on provided parameters
    Expects JSON payload with: keyword, language, category, country, pagesize
    """
    try:
        if not news_api:
            return jsonify({
                'status': 'error',
                'message': 'News API client not initialized. Please check API key configuration.'
            }), 500

        data = request.get_json()
        
        # Extract parameters
        keyword = data.get('keyword', '').strip()
        language = data.get('language', 'en')
        category = data.get('category', None)
        country = data.get('country', None)
        pagesize = data.get('pagesize', 20)

        # Validate keyword
        if not keyword:
            return jsonify({
                'status': 'error',
                'message': 'Keyword is required'
            }), 400

        # Validate pagesize
        try:
            pagesize = int(pagesize)
            if pagesize < 1 or pagesize > 100:
                pagesize = 20
        except (ValueError, TypeError):
            pagesize = 20

        # Build parameters for News API
        params = {
            'q': keyword,
            'language': language,
            'page': 1,
            'page_size': pagesize
        }

        # Add optional parameters
        if category and category.strip():
            params['category'] = category.lower()
        
        if country and country.strip():
            params['country'] = country.lower()

        # Call News API
        print(f"Fetching news with params: {params}")
        top_headlines = news_api.get_top_headlines(**params)

        # Extract articles
        articles = top_headlines.get('articles', [])
        
        # Process articles to ensure all data is serializable
        processed_articles = []
        for article in articles:
            processed_article = {
                'source': article.get('source', {}),
                'author': article.get('author'),
                'title': article.get('title'),
                'description': article.get('description'),
                'url': article.get('url'),
                'urlToImage': article.get('urlToImage'),
                'publishedAt': article.get('publishedAt'),
                'content': article.get('content')
            }
            processed_articles.append(processed_article)

        return jsonify({
            'status': 'success',
            'totalResults': top_headlines.get('totalResults', len(processed_articles)),
            'articles': processed_articles
        }), 200

    except newsapi.newsapi_exception.NewsAPIException as e:
        print(f"News API Error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'News API Error: {str(e)}'
        }), 400
    
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/article/<path:article_id>', methods=['GET'])
def get_article_details(article_id):
    """
    Get detailed information about a specific article
    This is a placeholder - you can extend it based on your needs
    """
    try:
        return jsonify({
            'status': 'success',
            'message': 'Article details endpoint'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Return available news categories"""
    categories = {
        'business': 'Business',
        'entertainment': 'Entertainment',
        'general': 'General',
        'health': 'Health',
        'science': 'Science',
        'sports': 'Sports',
        'technology': 'Technology'
    }
    return jsonify({
        'status': 'success',
        'categories': categories
    }), 200


@app.route('/api/languages', methods=['GET'])
def get_languages():
    """Return available languages"""
    languages = {
        'ar': 'Arabic',
        'de': 'German',
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'he': 'Hebrew',
        'it': 'Italian',
        'nl': 'Dutch',
        'no': 'Norwegian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'sv': 'Swedish',
        'zh': 'Chinese'
    }
    return jsonify({
        'status': 'success',
        'languages': languages
    }), 200


@app.route('/api/countries', methods=['GET'])
def get_countries():
    """Return available countries"""
    countries = {
        'ae': 'United Arab Emirates',
        'ar': 'Argentina',
        'at': 'Austria',
        'au': 'Australia',
        'be': 'Belgium',
        'bg': 'Bulgaria',
        'br': 'Brazil',
        'ca': 'Canada',
        'ch': 'Switzerland',
        'cn': 'China',
        'co': 'Colombia',
        'cu': 'Cuba',
        'cz': 'Czech Republic',
        'de': 'Germany',
        'eg': 'Egypt',
        'fr': 'France',
        'gb': 'United Kingdom',
        'gr': 'Greece',
        'hk': 'Hong Kong',
        'hu': 'Hungary',
        'id': 'Indonesia',
        'ie': 'Ireland',
        'il': 'Israel',
        'in': 'India',
        'it': 'Italy',
        'jp': 'Japan',
        'kr': 'South Korea',
        'lt': 'Lithuania',
        'lv': 'Latvia',
        'ma': 'Morocco',
        'mx': 'Mexico',
        'my': 'Malaysia',
        'ng': 'Nigeria',
        'nl': 'Netherlands',
        'no': 'Norway',
        'nz': 'New Zealand',
        'ph': 'Philippines',
        'pl': 'Poland',
        'pt': 'Portugal',
        'ro': 'Romania',
        'rs': 'Serbia',
        'ru': 'Russian Federation',
        'sa': 'Saudi Arabia',
        'se': 'Sweden',
        'sg': 'Singapore',
        'si': 'Slovenia',
        'sk': 'Slovak Republic',
        'th': 'Thailand',
        'tr': 'Turkey',
        'tw': 'Taiwan',
        'ua': 'Ukraine',
        'us': 'United States',
        've': 'Venezuela',
        'za': 'South Africa'
    }
    return jsonify({
        'status': 'success',
        'countries': countries
    }), 200


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    api_status = 'configured' if news_api else 'not configured'
    return jsonify({
        'status': 'success',
        'message': 'Server is running',
        'api_status': api_status
    }), 200


@app.errorhandler(404)
def not_found(e):
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500


if __name__ == '__main__':
    print("=" * 60)
    print("NewsFlow Server Starting...")
    print("=" * 60)
    if news_api:
        print("✓ News API client initialized successfully")
    else:
        print("✗ News API client not initialized - check API key")
    print("\nServer running at: http://localhost:5000")
    print("API Endpoints:")
    print("  POST /api/search - Search for news articles")
    print("  GET  /api/categories - Get available categories")
    print("  GET  /api/languages - Get available languages")
    print("  GET  /api/countries - Get available countries")
    print("  GET  /api/health - Health check")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
