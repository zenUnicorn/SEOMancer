# backend/main.py

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend import database, seo_analyzer, seo_improver
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the FastAPI app instance
app = FastAPI(
    title="SEOMancer API",
    description="An AI-powered SEO analysis and improvement tool.",
    version="1.0.0",
)

# --- Middleware ---
# Set up CORS (Cross-Origin Resource Sharing) to allow the frontend
# to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, you'd restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Database ---
# Create the database tables on startup
@app.on_event("startup")
def on_startup():
    """
    This function is called when the FastAPI application starts.
    It ensures that the necessary database tables are created.
    """
    logger.info("Application startup: Creating database tables...")
    database.create_tables()


# Dependency to get a new database session for each request
def get_db():
    """
    This function is a dependency that provides a database session to the API endpoints.
    It ensures that the session is properly closed after the request is finished.
    """
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Pydantic Models ---
# These models are used by FastAPI for request and response validation.
class AnalysisRequest(BaseModel):
    """
    Pydantic model for the request body of the /analyze endpoint.
    It expects a single field, 'url'.
    """

    url: str


class Report(BaseModel):
    """
    Pydantic model for the response of the /analyze endpoint.
    It defines the structure of the SEO report.
    """

    id: int
    url: str
    score: int
    suggestions: str

    class Config:
        orm_mode = True


# --- API Endpoints ---
@app.post("/analyze", response_model=Report)
def analyze_website(
    request: AnalysisRequest, db: Session = Depends(get_db)
) -> Report:
    """
    This is the main endpoint of the API. It takes a URL, performs an SEO analysis,
    generates improvement suggestions using an AI model, and returns a report.

    Args:
        request (AnalysisRequest): The request body containing the URL to analyze.
        db (Session): The database session, injected by the `get_db` dependency.

    Returns:
        Report: A Pydantic model containing the SEO report.
    """
    logger.info(f"Received analysis request for URL: {request.url}")

    # 1. Analyze the website's SEO
    analysis_result = seo_analyzer.analyze_seo(request.url)
    if "error" in analysis_result:
        logger.error(
            f"SEO analysis failed for {request.url}: {analysis_result['error']}"
        )
        raise HTTPException(status_code=400, detail=analysis_result["error"])

    # 2. Get SEO improvement suggestions from the AI model
    suggestions = seo_improver.improve_seo(analysis_result)
    if "Error" in suggestions:
        logger.error(
            f"Failed to get SEO suggestions for {request.url}: {suggestions}"
        )
        raise HTTPException(status_code=500, detail=suggestions)

    # 3. Save the report to the database
    db_report = database.Report(
        url=request.url,
        score=analysis_result["score"],
        suggestions=suggestions,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    logger.info(f"Report for {request.url} saved to the database with ID: {db_report.id}")

    return db_report


@app.get("/reports", response_model=list[Report])
def get_all_reports(db: Session = Depends(get_db)) -> list[Report]:
    """
    This endpoint retrieves all the SEO reports that have been saved to the database.

    Args:
        db (Session): The database session.

    Returns:
        list[Report]: A list of all SEO reports.
    """
    logger.info("Fetching all reports from the database.")
    reports = db.query(database.Report).all()
    return reports
