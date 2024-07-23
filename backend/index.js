import app from './app.js';

const port = process.env.PORT || 8010;

app.listen(port, () => console.log(`server is running on localhost:${port}`));
