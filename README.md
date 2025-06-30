# Weather Center Chat

A modern chat application with AI integration powered by Google ADK, built with Next.js frontend and FastAPI backend.

## Project Structure

```
weather-center-chat/
├── frontend/          # Next.js application
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/           # FastAPI application
│   ├── app/
│   ├── requirements.txt
│   └── ...
└── README.md
```

## Quick Start

### Frontend (Next.js)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
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
   cp env.example .env
   # Edit .env with your Google Cloud credentials
   ```

4. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Check API documentation:**
   Navigate to [http://localhost:8000/docs](http://localhost:8000/docs)

## Features

- **Modern Chat Interface**: Clean, responsive design with real-time messaging
- **Google ADK Integration**: Powered by Google's AI Platform with Gemini Pro
- **Separated Architecture**: Frontend and backend are completely independent
- **Type Safety**: Full TypeScript support in frontend, Pydantic models in backend
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

## Google ADK Setup

1. **Create a Google Cloud Project**
2. **Enable AI Platform API**
3. **Create a Service Account** and download the JSON key
4. **Set environment variables** in `backend/.env`:
   ```
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   ```

## Development

### Frontend Development
- Built with Next.js 14 and TypeScript
- Uses Tailwind CSS for styling
- Real-time chat interface with connection status

### Backend Development
- FastAPI with async support
- Google Cloud AI Platform integration
- CORS configured for frontend communication
- Structured with services, models, and API layers

## API Endpoints

- `GET /health` - Health check
- `POST /api/chat` - Chat with AI
- `GET /docs` - API documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the MIT License.

This is the weather application. In it, you can check the weather forecast and the history of weather for many locations around the world.
The application is also connected with Firebase Server.
The application is created in Next.js and Type Script.

Run Repository:
After cloning the repository to your computer, you should make sure that the node package manager has been installed. You can do this by typing the command in the terminal: npm -v. If it is not installed, you should download it and install it using the command: npm install Then run the front-end and back-end using the following command in the main folder with project in your terminal: npm run dev

Description:
This application connects to the database from which it downloads weather data. You can check this database here: 
https://www.visualcrossing.com/weather/weather-data-services

Depending on the path you are on, the app downloads the data in json type for the place in the world, what you entered in the input.
The data is displayed in a table or in the form of blocks that you can click on and display the appropriate modal.

I created 5 paths. 1 path is a nested path and 4 are main paths. Main Paths are: /history, /current /forecast and /comments. The nested path is /hours and it is nested in the path /current.
On the /history path you can search for historical weather data for the selected location. I implemented the react-datepicker for selecting the time period. 
On the /forecast and /current path you only have to enter the name of the location. 
On the path /comments you has to login using Google credentials if you want to see comments and add your own new comment. 
You can also like comments and remove your own comments. The comments are saving on Firebase Server after you submit it.
You can select between 2 pages if you want to see the data for the current day. 
On the path /current you see the latest data for your location with some general data for the all day. For example sunset and sunrise.
If you need see the data for every hour, you may hit the button "Weather for every hour" and you will be redirect to the path /current/hours.

I used several hooks in this project and I created one custom hook to store data in the browser storage. In components HistoryForm and CurrentForm has been used useRef.
I implemented also 2 modal components and I created 2 portals using the createPortal from react-dom. I placed the call to these functions in useEffect because I wanted to avoid the issue caused by use of an undeclared object document.body. 
In the code are also several conditional instructions to avoid hydration problems.
 
I have also implemented the selector of measurement system. You can select 3 systems: metric, imperial (Britisch) and imperial (American). 
The selected measurement system does not change if you refresh the page because the system is saved in the storage after every select.

I encourage you to check out my project! You may open it here: https://weather-center-ts-new.vercel.app/





