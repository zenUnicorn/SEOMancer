# backend/seo_analyzer.py

import requests
from bs4 import BeautifulSoup
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def analyze_seo(url: str) -> dict:
    """
    Analyzes the SEO of a given URL.

    This function fetches the HTML content of a URL, parses it to extract key SEO elements
    (title, meta description, headers), and returns them in a structured format.
    It also calculates a simple SEO score based on the presence of these elements.

    Args:
        url (str): The URL of the website to analyze.

    Returns:
        dict: A dictionary containing the SEO data and score.
              Example:
              {
                  "url": "http://example.com",
                  "title": "Example Domain",
                  "meta_description": "An example meta description.",
                  "headers": {"h1": ["Example Heading"], "h2": []},
                  "score": 80
              }
              Returns an error message in the dictionary if the analysis fails.
    """
    logger.info(f"Analyzing SEO for URL: {url}")
    try:
        # Fetch the HTML content of the URL.
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes
    except requests.RequestException as e:
        logger.error(f"Failed to fetch URL {url}: {e}")
        return {"error": f"Could not fetch the URL: {e}"}

    # Parse the HTML content using BeautifulSoup.
    soup = BeautifulSoup(response.content, "html.parser")

    # Extract SEO elements.
    title = soup.find("title").get_text(strip=True) if soup.find("title") else ""
    meta_description = (
        soup.find("meta", attrs={"name": "description"})["content"]
        if soup.find("meta", attrs={"name": "description"})
        else ""
    )

    headers = {"h1": [], "h2": [], "h3": [], "h4": [], "h5": [], "h6": []}
    for i in range(1, 7):
        header_tag = f"h{i}"
        for header in soup.find_all(header_tag):
            headers[header_tag].append(header.get_text(strip=True))

    # Calculate a simple SEO score.
    score = 0
    if title:
        score += 30
    if meta_description:
        score += 30
    if headers["h1"]:
        score += 20
    if headers["h2"]:
        score += 10
    if headers["h3"]:
        score += 10

    analysis_result = {
        "url": url,
        "title": title,
        "meta_description": meta_description,
        "headers": headers,
        "score": score,
    }

    logger.info(f"SEO analysis for {url} complete. Score: {score}")
    return analysis_result
