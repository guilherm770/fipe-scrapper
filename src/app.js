const express = require('express');
const routes = require('./routes');
const config = require('./config/app');

const app = express();
const PORT = config.port;

// Use routes
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
