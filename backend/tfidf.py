import json
import math
from collections import defaultdict

def load_articles():
    with open('../data/articles.json', 'r') as f:
        return json.load(f)

def calculate_tfidf(articles, user_interests):
    word_counts = defaultdict(lambda: defaultdict(int))
    document_counts = defaultdict(int)
    total_documents = len(articles)

    for article in articles:
        words = article['content'].split()
        unique_words = set(words)
        for word in words:
            word_counts[word][article['id']] += 1
        for word in unique_words:
            document_counts[word] += 1

    user_interests = user_interests.split()
    scores = defaultdict(float)
    for word in user_interests:
        if word in document_counts:
            idf = math.log(total_documents / (1 + document_counts[word]))
            for article_id in word_counts[word]:
                tf = word_counts[word][article_id]
                scores[article_id] += tf * idf

    return sorted(scores.items(), key=lambda x: x[1], reverse=True)

if __name__ == '__main__':
    articles = load_articles()
    interests = 'technology science'
    ranked_articles = calculate_tfidf(articles, interests)
    for article_id, score in ranked_articles:
        print(f'{article_id}: {score}')
