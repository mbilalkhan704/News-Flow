# NewsFlow - Server-Based News Aggregator

A modern news aggregator web application with a Python Flask backend and vanilla JavaScript frontend.

## Architecture

This application follows a client-server architecture:

- **Backend (Python Flask)**: Handles all News API interactions, business logic, and data processing
- **Frontend (JavaScript)**: Only handles DOM manipulation and communication with the backend
- **No API keys in frontend**: All sensitive data stays on the server

## Project Structure

```
news-aggregator/
├── app.py                      # Flask server (main backend)
├── requirements.txt            # Python dependencies
├── news_api_key.txt           # Your News API key (create this)
├── templates/
│   └── index.html             # Main HTML template
└── static/
    ├── css/
    │   └── styles.css         # All styling
    └── js/
        └── app.js             # Frontend JavaScript (DOM only)
```

## Setup Instructions

### 1. Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- A News API key (free from [newsapi.org](https://newsapi.org/))

### 2. Installation

**Step 1: Clone or download the project**

```bash
cd news-aggregator
```

**Step 3: Install dependencies**

```bash
pip install -r requirements.txt
```

### 3. Configure API Key

Create a file named `news_api_key.txt` in the project root directory:

```bash
echo YOUR_API_KEY_HERE > news_api_key.txt
```

Replace `YOUR_API_KEY_HERE` with your actual News API key.

**Alternative: Use Environment Variable**

Instead of creating a file, you can set an environment variable:

```bash
set NEWS_API_KEY=your_api_key_here
```

### 4. Run the Server

```bash
python app.py
```

You should see output like:

```
============================================================
NewsFlow Server Starting...
============================================================
✓ News API client initialized successfully

Server running at: http://localhost:5000
API Endpoints:
  POST /api/search - Search for news articles
  GET  /api/categories - Get available categories
  GET  /api/languages - Get available languages
  GET  /api/countries - Get available countries
  GET  /api/health - Health check
============================================================
```

### 5. Access the Application

Open your web browser and navigate to:

```
http://localhost:5000
```

## How It Works

### Backend (Python)

The Flask server (`app.py`) provides REST API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves the main HTML page |
| `/api/search` | POST | Searches for news articles |
| `/api/categories` | GET | Returns available categories |
| `/api/languages` | GET | Returns available languages |
| `/api/countries` | GET | Returns available countries |
| `/api/health` | GET | Server health check |

**Example API Request:**

```javascript
POST /api/search
Content-Type: application/json

{
    "keyword": "technology",
    "language": "en",
    "category": "technology",
    "country": "us",
    "pagesize": 20
}
```

**Example API Response:**

```json
{
    "status": "success",
    "totalResults": 20,
    "articles": [
        {
            "source": {"id": "techcrunch", "name": "TechCrunch"},
            "author": "John Doe",
            "title": "AI Revolution Continues",
            "description": "Latest developments in AI...",
            "url": "https://...",
            "urlToImage": "https://...",
            "publishedAt": "2024-02-09T10:00:00Z",
            "content": "Full article content..."
        }
    ]
}
```

### Frontend (JavaScript)

The frontend (`static/js/app.js`) only:

1. **Captures user input** from the search form
2. **Sends requests** to the Python backend
3. **Receives data** from the backend
4. **Updates the DOM** to display articles

**No business logic or API keys in the frontend!**

## Features

### Search & Filter
- Search by keyword
- Filter by language (13 languages)
- Filter by category (7 categories)
- Filter by country (50+ countries)
- Adjustable result count (1-100 articles)

### Display Options
- **Grid View**: Card-based layout
- **List View**: Detailed list format
- Responsive design for all screen sizes

### Article Details
- Click any article to view full details
- Modal popup with complete information
- Direct link to original article

### User Experience
- Smooth animations and transitions
- Loading states
- Error handling with toast notifications
- Beautiful dark theme UI

## API Endpoints Details

### POST /api/search

Search for news articles.

**Request Body:**
```json
{
    "keyword": "string (required)",
    "language": "string (optional, default: 'en')",
    "category": "string (optional)",
    "country": "string (optional)",
    "pagesize": "integer (optional, default: 20, max: 100)"
}
```

**Response:**
```json
{
    "status": "success",
    "totalResults": 20,
    "articles": [...]
}
```

### GET /api/categories

Get list of available categories.

**Response:**
```json
{
    "status": "success",
    "categories": {
        "business": "Business",
        "entertainment": "Entertainment",
        ...
    }
}
```

### GET /api/health

Check server health status.

**Response:**
```json
{
    "status": "success",
    "message": "Server is running",
    "api_status": "configured"
}
```

## Development

### Running in Development Mode

The server runs in debug mode by default, which provides:
- Auto-reload on code changes
- Detailed error messages
- Debug toolbar

### Production Deployment

For production, you should:

1. **Disable debug mode** in `app.py`:
   ```python
   app.run(debug=False, host='0.0.0.0', port=5000)
   ```

2. **Use a production WSGI server** like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Use a reverse proxy** like Nginx

4. **Set up HTTPS** with SSL certificates

5. **Use environment variables** for sensitive data:
   ```bash
   export NEWS_API_KEY=your_key
   export FLASK_ENV=production
   ```

## Troubleshooting

### Server won't start

**Problem**: `News API client not initialized`

**Solution**: 
- Make sure `news_api_key.txt` exists with your API key
- Or set the `NEWS_API_KEY` environment variable
- Check that the API key is valid

### No results found

**Problem**: Search returns no articles

**Solution**:
- Try different keywords
- Remove filters (category, country)
- Check API key limits (100 requests/day on free tier)
- Verify server logs for errors

### CORS errors

**Problem**: Frontend can't connect to backend

**Solution**:
- Make sure Flask-CORS is installed
- Server must be running before accessing the frontend
- Check that you're accessing `http://localhost:5000` (not opening HTML file directly)

### Port already in use

**Problem**: `Address already in use`

**Solution**:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Or change the port in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=8000)
```

## Customization

### Changing the Port

Edit `app.py`, line at the bottom:
```python
app.run(debug=True, host='0.0.0.0', port=YOUR_PORT)
```

### Adding New API Endpoints

Add new routes in `app.py`:
```python
@app.route('/api/your-endpoint', methods=['GET', 'POST'])
def your_endpoint():
    # Your logic here
    return jsonify({'status': 'success', 'data': {}})
```

### Modifying the UI

- **HTML**: Edit `templates/index.html`
- **CSS**: Edit `static/css/styles.css`
- **JavaScript**: Edit `static/js/app.js`

### Changing Colors

Edit CSS variables in `static/css/styles.css`:
```css
:root {
    --primary: #1a1a2e;
    --accent: #e94560;
    /* ... change these values ... */
}
```

## Security Notes

✅ **Good Practices:**
- API key is stored on the server
- User input is validated
- HTML is escaped to prevent XSS
- CORS is configured properly

⚠️ **Additional Recommendations:**
- Use HTTPS in production
- Implement rate limiting
- Add user authentication for production use
- Validate and sanitize all inputs
- Use environment variables for secrets
- Keep dependencies updated

## Dependencies

### Backend
- **Flask**: Web framework
- **Flask-CORS**: Handle Cross-Origin Resource Sharing
- **newsapi-python**: Official News API Python client
- **python-dotenv**: Load environment variables

### Frontend
- **Vanilla JavaScript**: No frameworks required
- **Google Fonts**: Playfair Display & Work Sans
- **CSS3**: Modern styling with animations

## News API Limitations

**Free Tier:**
- 100 requests per day
- Articles from the last 30 days
- Developer attribution required

**Paid Tiers:**
- Higher request limits
- Historical data access
- Commercial usage rights

Visit [newsapi.org/pricing](https://newsapi.org/pricing) for details.

## License

This project is open source and free to use for personal and educational purposes.

## Credits

- **Backend Framework**: Flask
- **News Data**: NewsAPI.org
- **Fonts**: Google Fonts
- **Design**: Custom implementation

## Support

If you encounter issues:

1. Check the server logs in the terminal
2. Check the browser console (F12)
3. Verify your API key is valid
4. Ensure all dependencies are installed

For News API issues, visit [newsapi.org/docs](https://newsapi.org/docs)

---

Built with ❤️ using Python Flask and Vanilla JavaScript
