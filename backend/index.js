import app from './app.js';

const port = process.argv[2] || 8000;

app.listen(port, () => console.log(`server is running on localhost:${port}`));
