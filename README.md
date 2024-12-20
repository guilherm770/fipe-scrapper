# Puppeteer Scraper Service

This project is a web scraping service built using Node.js, Puppeteer, and Express. It provides an endpoint to scrape data based on the FIPE code and year specified in the query parameters.

## Prerequisites

Ensure you have the following installed:

- Docker
- Node.js (optional, if running locally)

## Getting Started

### Build and Run with Docker

1. Build the Docker image:
   ```bash
   docker build -t puppeteer-scraper .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 puppeteer-scraper
   ```

### Accessing the Service

Send a GET request to the `/scrape` endpoint with the required query parameters:

```bash
curl "http://localhost:3000/scrape?fipeCode=001531-8&year=2025%20Gasolina"
```

### Query Parameters

- `fipeCode`: The FIPE code to scrape.
- `year`: The year and fuel type (e.g., `2025 Gasolina`).

### Response

The endpoint returns a JSON object:

- `success`: Indicates if the scraping was successful.
- `data`: Contains the scraped data (if successful).
- `error`: Provides error details (if unsuccessful).

## File Structure

```plaintext
project/
├── src/
│   ├── app.js             # Main Express app
│   ├── routes/            # API routes
│   │   ├── index.js
│   │   └── handler.js
│   │   └── scrape.js
│   ├── services/          # Business logic
│   │   ├── browser.js
│   │   └── handler.js
│   │   └── scrape.js
│   ├── utils/             # Utilities
│   │   └── validation.js
│   └── config/            # Config files
│       ├── puppeteer.js
│       └── app.js
│       └── logger.js
├── tests/                 # Test files
├── Dockerfile             # Dockerfile to build the app
├── package.json           # Node.js dependencies
├── .env                   # Environment variables
├── .dockerignore          # Docker ignore file
├── .gitignore          # git ignore file
└── README.md              # Documentation
```

## Environment Variables

Create a `.env` file in the project root with the following content:

```env
PORT=3000
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

---