# assisT - AI-Powered Teaching Assistant

**assisT** is an AI-powered educational platform designed to alleviate the workload of teachers in environments with high student-to-teacher ratios, enabling personalized feedback and progress tracking for every student. Developed for the Google Developer Groups on Campus Solution Challenge (Problem Statement: Overburdened Teachers and the Need for Personalized Feedback).
## Preview 
![Screenshots of the app](assets/screenshots.png)
## The Problem

In many educational settings, particularly in India, teachers face immense pressure due to large class sizes. This makes it incredibly difficult, if not impossible, to provide individual attention and timely, constructive feedback to each student. As a result:

*   Students don't receive personalized guidance on their strengths and weaknesses.
*   Progress tracking becomes generic and lacks individual insights.
*   High-achieving students miss opportunities to be challenged further.
*   Struggling students don't get the targeted help they need to improve.

## Our Solution: assisT

**assisT** provides an end-to-end platform, similar in concept to Google Classroom, but with a powerful AI engine at its core focused on automated, detailed feedback generation for assignments.

**Core Workflow:**

1.  **Setup:** Teachers sign up, create classes, and share unique class codes. Students sign up and join classes using these codes.
2.  **Interaction:** Teachers post announcements, share materials (PPTs, PDFs, etc.), and create assignments with descriptions, attached files, and deadlines.
3.  **Submission:** Students view class content, access assignments, complete their work offline, and submit their solutions (PDF, DOCX).
4.  **AI Grading & Feedback:**
    *   Teachers can optionally upload an answer key.
    *   Once ready (deadline passed or all submitted), the teacher initiates the grading process for an assignment.
    *   **Behind the Scenes:**
        *   The task is queued in the background (FastAPI BackgroundTasks + Redis for status tracking).
        *   For each submission, a sophisticated pipeline runs:
            *   **File Preparation:** Downloads assignment details, materials, answer key (if provided), and the student's submission.
            *   **Advanced OCR:** Extracts text and *diagrams* from the submission. Uses Mistral AI's OCR model for layout and diagram extraction (embedding diagrams inline) and Google Gemini for robust handwritten/text OCR. Merges results page-wise, then sorts content question-wise into a Markdown file.
            *   **Rubric Generation:** If not already done for the assignment, generates a detailed, question-wise grading rubric using assignment details, materials, and *especially* the answer key (or generates one if missing).
            *   **Multimodal Grading:** Uses Google Gemini's multimodal capabilities to evaluate each question based on the OCR'd text, extracted diagrams, and the generated rubric. Logs detailed reasoning, scores, strengths, weaknesses, and actionable improvement suggestions (using fine-tuned prompts with examples).
            *   **Structured Output:** Converts the detailed Markdown feedback into structured JSON via an intermediate Semantic XML step for robustness against syntax errors.
            *   **Saving:** Stores the grades and structured feedback in the database.
            *   **Status Update:** Updates submission status in Redis.
5.  **Teacher Review:** Teachers can review the AI-generated feedback and grades for each submission. They see the OCR'd text/diagrams alongside the feedback and can edit/approve it before releasing it to the student.
6.  **Student Insights:** Students receive detailed, actionable feedback on their performance for each question and overall, view their grades, and track upcoming assignments via a Todo list.

## Key Features

*   **User Roles:** Distinct interfaces and capabilities for Teachers and Students.
*   **Class Management:** Create, join, and manage virtual classrooms.
*   **Content Sharing:** Announcements and class material uploads (PDF, DOCX, PPT, etc.).
*   **Assignment Workflow:** Creation, distribution, submission, and tracking.
*   **AI-Powered Grading:**
    *   Handwritten OCR with Diagram Extraction.
    *   Automated Rubric Generation (Answer-key driven).
    *   Multimodal Question Evaluation.
    *   Detailed, Actionable Feedback Generation (Strengths, Weaknesses, Improvement Areas).
*   **Teacher Review:** Ability for teachers to review, edit, and approve AI feedback before release.
*   **Progress Tracking:** Real-time status updates for grading tasks, student Todo lists.
*   **Secure Authentication:** JWT-based authentication with Google OAuth option.

## Tech Stack

*   **Frontend:** React, Redux Toolkit, TypeScript, Vite, React-Markdown, Tailwind CSS
*   **Backend:** FastAPI (Python), SQLAlchemy (PostgreSQL ORM), Pydantic, google-genai, mistralai-sdk
*   **Database:** PostgreSQL
*   **Cache:** Redis (for background task status tracking)
*   **AI/ML:**
    *   Google Gemini API (via AI Studio) - `gemini-2.0-flash`, `gemini-2.0-flash-thinking-exp-01-21`
    *   Mistral AI API (La Plateforme) - OCR model
    *   FastAPI BackgroundTasks
*   **File Storage:** Google Cloud Storage (GCS)
*   **Infrastructure:** Google Cloud Compute (Self-hosted)
*   **Authentication:** JWT, Google OAuth 2.0
*   **Dependencies:** Pandoc (for potential document conversions)

## Project Structure


```
├── README.md
├── client/ # Frontend React Application
│ ├── package.json
│ ├── .env.example # Frontend environment variables template
│ ├── src/
│ ├── components/ # React UI Components
│ ├── features/ # Redux Slices / State Management
│ ├── store/ # Redux Store Configuration
│ ├── api/ # API interaction logic
│ └── ... # Other React files (App.tsx, main.tsx)
└── server/ # Backend FastAPI Application
  ├── .env.example # Backend environment variables template
  ├── requirements.txt # Python dependencies
  ├── config.py # Configuration loading
  ├── main.py # FastAPI app entry point
  ├── db/ # Database models and session management
  ├── routers/ # API endpoint definitions (auth, classes, assignments, etc.)
  └── utils/ # Utility functions (AI interactions, GCS, etc.)
```

## Setup Instructions

### Prerequisites

*   Git
*   Python 3.8+, Pip and python-venv or conda or mamba for virtual environment
*   Node.js (v18+) and npm
*   PostgreSQL Server (Running and accessible)
*   Redis Server (Running and accessible)
*   Pandoc (`sudo apt-get install pandoc` for ubuntu or `sudo pacman -Syu pandoc` for arch linux)
*   Google Cloud Account with:
    *   Google Cloud Storage (GCS) bucket created.
    *   Service Account key file (`.json`) with GCS permissions.
    *   Google AI Studio API Key (for Gemini).
    *   Google OAuth Credentials (Client ID, Client Secret).
*   Mistral AI API Key.

### Installation & Configuration

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shubhamkumaar/GDG_assisT.git
    cd GDG_assisT
    ```

2.  **Backend Setup:**
    ```bash
    cd server

    # Create and activate a virtual environment (recommended)
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`

    # Or use conda/mamba
    conda create -n "assist"
    conda activate assist

    # Install dependencies
    pip install -r requirements.txt

    # Create .env file from example
    cp .env.example .env

    # Edit .env file and add your credentials:
    # MISTRAL_API_KEY="YOUR_MISTRAL_API_KEY"
    # GENAI_API_KEY="YOUR_GEMINI_API_KEY"
    # GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/gcs-service-account.json"
    # SQLALCHEMY_DATABASE_URL="postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
    # SECRET_KEY="YOUR_RANDOM_JWT_SECRET_KEY" # Generate a strong random key
    # ALGORITHM="HS256"
    # ACCESS_TOKEN_EXPIRE_MINUTES=60 # Or your preferred duration
    # GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
    # GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
    # REDIS_HOST="localhost" # Or your Redis host
    # REDIS_PORT=6379        # Or your Redis port
    ```
    *Ensure your PostgreSQL database exists and the URL is correct.*
    *Make sure the path to `GOOGLE_APPLICATION_CREDENTIALS` is correct.*

3.  **Frontend Setup:**
    ```bash
    cd ../client

    # Install dependencies
    npm install

    # Create .env file from example
    cp .env.example .env

    # Edit .env file and add your credentials:
    # VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
    # VITE_GOOGLE_REDIRECT_URI= "http://localhost:8000/auth/google/callback" # Or your callback URL
    # VITE_API_URL="http://localhost:8000" # Your backend API base URL
    ```

### Running the Application

1.  **Run the Backend Server:**
    ```bash
    # cd to root folder of the repo
    cd ..
    # Make sure your virtual environment is activated
    uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
    ```
    The backend API will be available at `http://localhost:8000`.

2.  **Run the Frontend Development Server:**
    ```bash
    cd client
    npm run dev
    ```
    The frontend application will be available at `http://localhost:5173` (or another port if 5173 is busy).

3.  **Access the Application:** Open your web browser and navigate to `http://localhost:5173`.

## API Documentation

The backend API uses FastAPI, which automatically generates interactive API documentation. Once the backend server is running, you can access it at:

*   **Swagger UI:** `http://localhost:8000/docs`
*   **ReDoc:** `http://localhost:8000/redoc`
*   **OpenAPI Schema:** `http://localhost:8000/openapi.json`

Key endpoint groups include: `/auth`, `/classes`, `/assignment`, `/automated_feedback`, `/profile`.

## Future Plans

*   **Enhanced Dashboards:**
    *   **Teacher:** Visualize class progress, common mistakes, topic mastery levels.
    *   **Student:** Personalized learning roadmaps based on past performance, non-intimidating class standing comparison.
*   **Non-Graded Quizzes:** Auto-generate quizzes from materials for low-stakes progress checks.
*   **Multilingual Support:** Localize the platform for wider reach in diverse linguistic regions.
*   **Bulk Student Onboarding:** Allow teachers to add students via Excel/CSV uploads, sending email invitations.

## Contributing

This project was developed for a hackathon. If you wish to contribute further, please feel free to fork the repository and submit pull requests.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request


## Team Info
*   Team Code Xtreme
*   Project Link: [assisT](https://github.com/shubhamkumaar/GDG_assisT)
*   Team Members:
    *   [Divyansh Karan](https://github.com/DivyanshKaran)
    *   [Kanishak Sangwan](https://github.com/Kan1shak)
    *   [Ritvik Anand](https://github.com/RitvikAnand583)
    *   [Shubham Kumar](https://github.com/shubhamkumaar)  