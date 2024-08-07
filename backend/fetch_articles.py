import os
import requests
import json
from datetime import datetime, timedelta

GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/doc/doc'
GDELT_API_KEY = 'your_gdelt_api_key'

def fetch_articles():
    try:
        # Set date to the past 7 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        date_str = start_date.strftime('%Y%m%d')

        # Query parameters for GDELT API
        params = {
            'query': 'news',  # Replace with actual query if needed
            'format': 'json',
            'maxrecords': 50,  # Adjust as needed
            'startdatetime': date_str,
            'enddatetime': end_date.strftime('%Y%m%d'),
            'apikey': GDELT_API_KEY
        }

        response = requests.get(GDELT_API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        articles = data.get('articles', [])

        processed_articles = []
        for article in articles:
            processed_articles.append({
                'id': article['url'],
                'title': article['title'],
                'description': article['description'],
                'content': article['content'],
                'url': article['url'],
                'published_at': article['publishedAt'],
                'source': article['source']['name']
            })

        # Ensure the data directory exists
        data_dir = '../data'
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)

        # Write articles to the JSON file
        with open(os.path.join(data_dir, 'articles.json'), 'w') as f:
            json.dump(processed_articles, f, indent=4)

        print("Articles fetched and saved successfully.")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching articles: {e}")

if __name__ == '__main__':
    fetch_articles()
