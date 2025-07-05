# Weather Center Chat

A modern weather application with AI chat integration powered by Google ADK, built with Next.js frontend and FastAPI backend. The application provides current weather, forecasts, historical data, and AI-powered chat assistance.

## Project Structure

```
weather-center-chat/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # React components
│   │   │   ├── views/          # Page components
│   │   │   ├── services/       # API services
│   │   │   └── ...
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/           # FastAPI application
│   ├── api/           # Main API application
│   │   ├── main.py    # FastAPI app with endpoints
│   │   ├── models.py  # Pydantic models
│   │   └── weather_service.py # Weather API service
│   ├── agent_system/  # Google ADK agent system
│   └── ...
└── README.md
```

## Features

- **🌤️ Weather Data**: Current weather, forecasts, and historical data
- **🤖 AI Chat Assistant**: Powered by Google ADK with weather tools
- **🔒 Secure Architecture**: Backend handles all external API calls
- **📱 Modern UI**: Responsive design with Tailwind CSS
- **🔧 Type Safety**: Full TypeScript support with Pydantic models
- **📊 Data Visualization**: Interactive weather displays and charts

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- Visual Crossing Weather API key
- Google Cloud credentials (for AI chat)

### Frontend (Next.js)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend (FastAPI)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   # Create .env file in backend/agent_system/src/multi_tool_agent/
   cp backend/agent_system/src/multi_tool_agent/.env.example backend/agent_system/src/multi_tool_agent/.env
   # Edit .env with your API keys:
   # VISUAL_CROSSING_API_KEY=your_visual_crossing_key
   # GOOGLE_API_KEY=your_google_api_key
   ```

4. **Start the backend server:**
   ```bash
   python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Check API documentation:**
   Navigate to [http://localhost:8000/docs](http://localhost:8000/docs)

## Application Description

This is the weather application. In it, you can check the weather forecast and the history of weather for many locations around the world.
The application is also connected with Firebase Server for comments functionality.
The application is created in Next.js and TypeScript.

### How It Works Now

**Updated Architecture**: The application now uses a secure backend API architecture where:
- **Frontend** communicates only with our **Backend API**
- **Backend** handles all external API calls (Visual Crossing Weather API, Google ADK)
- **No direct API calls** from frontend to external services
- **Enhanced security** with API keys stored securely in backend

**Data Flow**: 
1. User enters location in frontend
2. Frontend sends request to our backend API
3. Backend calls Visual Crossing Weather API
4. Backend processes and validates data with Pydantic models
5. Backend returns clean, validated JSON to frontend
6. Frontend displays weather data

### Run Repository

After cloning the repository to your computer, you should make sure that the node package manager has been installed. You can do this by typing the command in the terminal: `npm -v`. If it is not installed, you should download it and install it using the command: `npm install`.

**Updated Setup Process:**
1. **Start Backend First**: Run the FastAPI backend server
2. **Start Frontend**: Run the Next.js frontend application
3. **Both services** need to be running simultaneously

### Application Features

This application connects to the Visual Crossing Weather API through our secure backend from which it downloads weather data. You can check this database here: 
https://www.visualcrossing.com/weather/weather-data-services

Depending on the path you are on, the app downloads the data in JSON type for the place in the world that you entered in the input.
The data is displayed in a table or in the form of blocks that you can click on and display the appropriate modal.

### Application Paths

I created 5 paths. 1 path is a nested path and 4 are main paths. Main Paths are: `/history`, `/current`, `/forecast`, and `/comments`. The nested path is `/hours` and it is nested in the path `/current`.

- **`/history`**: You can search for historical weather data for the selected location. I implemented the react-datepicker for selecting the time period.
- **`/forecast` and `/current`**: You only have to enter the name of the location.
- **`/comments`**: You have to login using Google credentials if you want to see comments and add your own new comment. You can also like comments and remove your own comments. The comments are saving on Firebase Server after you submit it.

### Current Day Data

You can select between 2 pages if you want to see the data for the current day.
- **`/current`**: You see the latest data for your location with some general data for the all day. For example sunset and sunrise.
- **`/current/hours`**: If you need to see the data for every hour, you may hit the button "Weather for every hour" and you will be redirected to the path `/current/hours`.

### Technical Implementation

I used several hooks in this project and I created one custom hook to store data in the browser storage. In components HistoryForm and CurrentForm has been used useRef.
I implemented also 2 modal components and I created 2 portals using the createPortal from react-dom. I placed the call to these functions in useEffect because I wanted to avoid the issue caused by use of an undeclared object document.body.
In the code are also several conditional instructions to avoid hydration problems.

### Measurement System

I have also implemented the selector of measurement system. You can select 3 systems: metric, imperial (British) and imperial (American).
The selected measurement system does not change if you refresh the page because the system is saved in the storage after every select.

### AI Chat Assistant

**New Feature**: The application now includes an AI chat assistant powered by Google ADK that can:
- Answer weather-related questions
- Provide weather information for any location
- Use natural language processing
- Access weather tools and data

## API Endpoints

### Weather Endpoints
- `POST /api/weather/current` - Get current weather for a location
- `POST /api/weather/forecast` - Get weather forecast (1-14 days)
- `POST /api/weather/history` - Get historical weather data

### Chat Endpoints
- `POST /api/chat` - Chat with AI assistant
- `GET /health` - Health check

### Example Requests

**Current Weather:**
```bash
curl -X POST "http://localhost:8000/api/weather/current" \
  -H "Content-Type: application/json" \
  -d '{"location": "London"}'
```

**Forecast Weather:**
```bash
curl -X POST "http://localhost:8000/api/weather/forecast" \
  -H "Content-Type: application/json" \
  -d '{"location": "London", "days": 7}'
```

**Historical Weather:**
```bash
curl -X POST "http://localhost:8000/api/weather/history" \
  -H "Content-Type: application/json" \
  -d '{"location": "London", "start_date": "2024-06-01", "end_date": "2024-06-07"}'
```

## Architecture

### Frontend → Backend → External APIs
- **Frontend**: Next.js with TypeScript, communicates only with backend
- **Backend**: FastAPI with Pydantic models, handles all external API calls
- **External APIs**: Visual Crossing Weather API, Google ADK

### Data Flow
1. User enters location in frontend
2. Frontend sends request to backend
3. Backend calls Visual Crossing API
4. Backend processes and validates data with Pydantic
5. Backend returns clean JSON to frontend
6. Frontend displays weather data

## Weather Features

### Current Weather Page (`/current`)
- Real-time weather conditions
- Temperature, humidity, wind speed/direction
- Pressure, visibility, UV index
- Sunrise and sunset times
- Hourly breakdown available

### Forecast Weather Page (`/forecast`)
- 15-day weather forecast
- Daily temperature ranges
- Weather conditions and icons
- Wind and pressure data

### History Weather Page (`/history`)
- Historical weather data
- Date range selection
- Past temperature and conditions
- Historical trends

### AI Chat Assistant
- Weather-related queries
- Powered by Google ADK
- Integrated weather tools
- Natural language processing

## Environment Variables

### Backend (.env)
```env
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key
GOOGLE_API_KEY=your_google_api_key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Frontend Development
- Built with Next.js 14 and TypeScript
- Uses Tailwind CSS for styling
- Real-time weather updates
- Responsive design for all devices

### Backend Development
- FastAPI with async support
- Pydantic models for data validation
- Visual Crossing API integration
- Google ADK agent system
- CORS configured for frontend communication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Live Demo

Check out the live application: [Weather Center Chat](https://weather-center-ts-new.vercel.app/)

I encourage you to check out my project! You may open it here: https://weather-center-ts-new.vercel.app/





