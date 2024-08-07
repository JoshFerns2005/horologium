from flask import Flask, request, jsonify, send_from_directory
import os
import json
from fetch_articles import fetch_articles

app = Flask(__name__, static_folder='../static')

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/styles.css')
def styles():
    return send_from_directory('../frontend', 'styles.css')

@app.route('/script.js')
def script():
    return send_from_directory('../frontend', 'script.js')

@app.route('/get_articles', methods=['POST'])
def get_articles():
    try:
        interests = request.json.get('interests', '')
        with open('../data/articles.json', 'r') as f:
            articles = json.load(f)

        # Filter articles based on interests (basic keyword match)
        filtered_articles = [article for article in articles if any(interest.lower() in article['title'].lower() for interest in interests.split())]

        return jsonify({'articles': filtered_articles})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/rate_article', methods=['POST'])
def rate_article():
    try:
        article_id = request.json.get('article_id')
        rating = request.json.get('rating')
        
        # Load ratings from a JSON file
        ratings_file = '../data/ratings.json'
        if os.path.exists(ratings_file):
            with open(ratings_file, 'r') as f:
                ratings = json.load(f)
        else:
            ratings = {}

        # Update the rating for the article
        if article_id in ratings:
            ratings[article_id]['count'] += 1
            ratings[article_id]['sum'] += rating
        else:
            ratings[article_id] = {'count': 1, 'sum': rating}

        # Save updated ratings
        with open(ratings_file, 'w') as f:
            json.dump(ratings, f, indent=4)

        return jsonify({'message': 'Rating submitted successfully.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    fetch_articles()  # Ensure articles are fetched when starting the app
    app.run(debug=True)
