document.getElementById('interest-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const interests = document.getElementById('interests').value;

    fetch('/get_articles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interests: interests }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error fetching articles:', data.error);
            return;
        }
        displayArticles(data.articles);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function displayArticles(articles) {
    const articlesDiv = document.getElementById('articles');
    articlesDiv.innerHTML = '';

    articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article');

        articleDiv.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <a href="${article.url}" target="_blank">Read more</a>
            <br>
            <button onclick="rateArticle('${article.id}', 1)">👍</button>
            <button onclick="rateArticle('${article.id}', -1)">👎</button>
        `;

        articlesDiv.appendChild(articleDiv);
    });
}

function rateArticle(articleId, rating) {
    fetch('/rate_article', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article_id: articleId, rating: rating }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error rating article:', data.error);
        } else {
            console.log('Rating submitted successfully.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
