# University Chatbot Backend

Backend server for the University Chatbot with RAG (Retrieval Augmented Generation) using OpenAI and ChromaDB.

## Features

- **RAG Implementation**: Uses ChromaDB for vector storage and retrieval
- **OpenAI Integration**: GPT-4 for intelligent responses
- **Category-based Responses**: Handles campus navigation, admissions, courses, and general Q&A
- **RESTful API**: Easy integration with frontend

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
CHROMA_PATH=./chroma_db
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### 3. Prepare Your University Data

Edit `data/university-info.json` with your actual university information. The file should contain:

- `campusNavigation`: Buildings, locations, parking, facilities
- `admissions`: Requirements, deadlines, fees, scholarships
- `courses`: Course codes, descriptions, prerequisites, credits
- `generalInfo`: FAQs, contact info, general university information

### 4. Load Data into Vector Database

```bash
npm run load-data
```

This will:
- Initialize ChromaDB
- Process your university data
- Create embeddings using OpenAI
- Store everything in the vector database

### 5. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### 1. Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "message": "University Chatbot API is running"
}
```

### 2. Send Chat Message
```
POST /api/chat/message
```

Request body:
```json
{
  "message": "Where is the library located?",
  "category": "campus-navigation"
}
```

Categories: `general`, `campus-navigation`, `admissions`, `courses`

Response:
```json
{
  "success": true,
  "data": {
    "message": "The Main Library is located in the center of campus...",
    "category": "campus-navigation",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Search Knowledge Base
```
POST /api/chat/search
```

Request body:
```json
{
  "query": "computer science courses",
  "limit": 5
}
```

Response:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "content": "CS101 - Introduction to Computer Science...",
        "metadata": {
          "category": "courses",
          "code": "CS101"
        },
        "distance": 0.234
      }
    ],
    "count": 5
  }
}
```

## Frontend Integration Example

```javascript
// Send a message
async function sendMessage(message, category = 'general') {
  const response = await fetch('http://localhost:5000/api/chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, category }),
  });
  
  const data = await response.json();
  return data.data.message;
}

// Usage
const reply = await sendMessage('What are the admission requirements?', 'admissions');
console.log(reply);
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── chatController.js      # Request handlers
│   ├── services/
│   │   ├── aiService.js           # OpenAI integration
│   │   └── vectorService.js       # ChromaDB operations
│   ├── routes/
│   │   └── chatRoutes.js          # API routes
│   ├── scripts/
│   │   └── loadData.js            # Data loading script
│   └── app.js                     # Express server
├── data/
│   └── university-info.json       # Your university data
├── .env                           # Environment variables
├── package.json
└── README.md
```

## Troubleshooting

### ChromaDB Connection Issues
If you get connection errors, make sure ChromaDB is properly initialized. The default setup uses local ChromaDB. For production, consider using ChromaDB in server mode.

### OpenAI API Errors
- Check your API key is valid
- Ensure you have sufficient credits
- Monitor rate limits

### Data Loading Fails
- Verify `university-info.json` exists and has valid JSON
- Check the file structure matches the example
- Look for error messages in the console

## Next Steps

1. Add more comprehensive university data
2. Implement conversation history
3. Add user feedback collection
4. Create admin panel for updating information
5. Add analytics and monitoring
6. Implement caching for faster responses

## Cost Considerations

- **OpenAI Embeddings**: ~$0.0001 per 1K tokens
- **GPT-4 API**: ~$0.03 per 1K tokens (input), ~$0.06 per 1K tokens (output)
- **ChromaDB**: Free for local usage

Estimate: ~$0.05-0.10 per conversation depending on length and complexity.

## License

MIT