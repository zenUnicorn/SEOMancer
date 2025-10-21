# backend/database.py

from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Define the database connection URL.
# For this local-first application, we'll use a simple SQLite database.
DATABASE_URL = "sqlite:///./seomancer.db"

# Create a SQLAlchemy engine.
# The `connect_args` is specific to SQLite and is needed to allow multithreading,
# which is relevant when using FastAPI with background tasks.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create a sessionmaker to manage database sessions. This is the factory for new Session objects.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class for declarative models. Our DB model will inherit from this class.
Base = declarative_base()


# Define the Report model, which corresponds to the "reports" table in the database.
class Report(Base):
    """
    Represents an SEO analysis report for a specific URL.
    Each instance of this class will be a row in the 'reports' table.
    """
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True, nullable=False)
    score = Column(Integer, nullable=False)
    suggestions = Column(Text, nullable=False)

    def __repr__(self):
        return f"<Report(url='{self.url}', score={self.score})>"


# Function to create the database tables.
def create_tables():
    """
    Creates all the database tables defined in the Base metadata.
    This function can be called at the application startup to ensure
    the database and tables are created.
    """
    Base.metadata.create_all(bind=engine)
