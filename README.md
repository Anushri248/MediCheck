# MediCheck

MediCheck is a full-stack healthcare web application that empowers administrators to manage patient blood test records and generate AI-powered health predictions using the Google Gemini API. By analyzing key vitals like glucose, haemoglobin, and cholesterol alongside patient demographics, MediCheck generates a detailed clinical health report complete with risk level assessments and actionable recommendations.

## Features

- **Comprehensive Patient Management:** Full CRUD operations for patient records.
- **Smart Dashboard:** Interactive cards summarizing Total Patients, At Risk, Needs Monitoring, and Added This Week. Click any card to instantly filter the patient list.
- **AI-Powered Health Analysis:** Gender and age-aware clinical analysis utilizing Google's Gemini API.
- **Structured Health Reports:** Detailed AI reports broken down into Clinical Summary, Identified Risks, Recommendations, and Follow Up plans.
- **Visual Risk Indicators:** Color-coded risk level badges (High, Moderate, Low) for quick triage.
- **Detailed Patient Views:** A clean, professional modal to view patient vitals alongside their full AI health report.
- **Search & Filter:** Quickly find patients by name or email.
- **Data Integrity:** Strict input validation on all vital sign and demographic fields.

## Tech Stack

- **Frontend:** React.js, Bootstrap, Tailwind CSS
- **Backend:** Python, Flask, Flask-CORS
- **Database:** SQLite, SQLAlchemy
- **AI Integration:** Google Gemini API

## Project Structure

```text
medicheck/
├── backend/
│   ├── instance/
│   │   └── medicheck.db       # SQLite Database
│   ├── ai_service.py          # Gemini API integration and prompting logic
│   ├── app.py                 # Flask application and API routes
│   ├── init_db.py             # Script to initialize database tables
│   ├── models.py              # SQLAlchemy database models
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Environment variables template
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── PatientDetailModal.jsx
    │   │   ├── PatientModal.jsx
    │   │   └── PatientTable.jsx
    │   ├── pages/
    │   │   └── Dashboard.jsx
    │   ├── services/
    │   │   └── api.js         # Frontend API integration
    │   ├── App.js
    │   └── index.js
    └── package.json           # Node.js dependencies
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://www.python.org/) (3.8+)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd medicheck
   ```

2. **Set up the Backend:**
   ```bash
   cd backend
   
   # Create and activate a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env and add your Gemini API key
   
   # Initialize the database
   python init_db.py
   
   # Run the Flask server
   python app.py
   ```

3. **Set up the Frontend:**
   ```bash
   # Open a new terminal window
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start the React development server
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Environment Variables

The backend requires a `.env` file to run securely. You can copy the provided `.env.example` file and fill in your values.

```env
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_SECRET_KEY=your_secure_secret_key_here
FLASK_ENV=development
```

- `GEMINI_API_KEY`: Your private API key from Google AI Studio. Required for generating health reports.
- `FLASK_SECRET_KEY`: A random string used by Flask to secure sessions.
- `FLASK_ENV`: Set to `development` to enable debug mode and hot reloading on the backend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | Retrieve a list of all patient records |
| `POST` | `/api/patients` | Create a new patient and generate initial AI report |
| `PUT` | `/api/patients/<id>` | Update an existing patient's details and regenerate AI report |
| `DELETE` | `/api/patients/<id>` | Delete a patient record |

## How AI Integration Works

MediCheck utilizes the Google Gemini API to translate raw medical data into readable clinical insights. Before sending data to the AI, the backend calculates the patient's exact age from their date of birth and ensures their gender is explicitly included in the context window. This is critical because normal physiological ranges for haemoglobin and cholesterol vary significantly based on biological sex and age. The AI is prompted with a strict JSON schema, ensuring the application always receives structured data (Clinical Summary, Identified Risks, Recommendations) that can be reliably and beautifully rendered in the UI.

## Screenshots

<!-- Add screenshots here -->
