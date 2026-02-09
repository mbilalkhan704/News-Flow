# NewsFlow - Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 2: Get Your API Key

1. Go to https://newsapi.org/register
2. Sign up for a free account
3. Copy your API key

## Step 3: Configure API Key

Create a file named `news_api_key.txt` in the project folder:

```bash
echo "paste_your_api_key_here" > news_api_key.txt
```

## Step 4: Start the Server

```bash
python app.py
```

## Step 5: Open Your Browser

Navigate to: **http://localhost:5000**

That's it! 🎉

## Usage

1. Enter a search keyword (e.g., "technology", "sports")
2. (Optional) Select filters: language, category, country
3. Click "Search News"
4. Click any article card to see full details
5. Toggle between Grid and List views

## Troubleshooting

**Can't install dependencies?**
```bash
# Make sure pip is up to date
python -m pip install --upgrade pip

# Try installing one by one
pip install Flask
pip install Flask-CORS
pip install newsapi-python
```

**Server won't start?**
- Make sure `news_api_key.txt` exists
- Check that your API key is valid
- Try using port 8000 if 5000 is busy (edit `app.py` last line)

**No results?**
- Try different keywords
- Remove filters
- Check API limits (100 requests/day on free tier)

## Next Steps

- Read the full README.md for detailed documentation
- Customize colors in `static/css/styles.css`
- Add features in `app.py` and `static/js/app.js`
- Deploy to production (see README.md)

---

Need help? Check the full README.md or server logs for details.
