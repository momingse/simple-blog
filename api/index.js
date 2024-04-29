const app = require('express')();

app.get('/', (req, res) => {
  const path = '/item/1';
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`<p>Hello! Go to item: <a href="${path}">${path}</a></p>`);
});

app.get('/item/:slug', (req, res) => {
  const { slug } = req.params;
  res.end(`<p>Item: ${slug}</p><a href="/">Go back</a>`);
});

module.exports = app;
