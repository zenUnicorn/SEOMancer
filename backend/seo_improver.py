# backend/seo_improver.py

from backend.ollama_interface import get_seo_suggestions
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def improve_seo(analysis_result: dict) -> str:
    """
    Improves SEO based on an analysis report.

    This function takes the result from the `analyze_seo` function, formats it
    into a string, and sends it to the Ollama LLM to get improvement suggestions.

    Args:
        analysis_result (dict): The dictionary containing the SEO analysis data,
                                including title, meta description, and headers.

    Returns:
        str: A string containing the AI-generated SEO suggestions.
    """

    # Format the analysis result into a string to be used as a prompt for the LLM.
    current_seo_data = f"""
    URL: {analysis_result.get("url", "N/A")}
    Title: {analysis_result.get("title", "N/A")}
    Meta Description: {analysis_result.get("meta_description", "N/A")}
    H1 Headers: {", ".join(analysis_result.get("headers", {}).get("h1", []))}
    H2 Headers: {", ".join(analysis_result.get("headers", {}).get("h2", []))}
    """

    logger.info(
        f"Requesting SEO improvements for URL: {analysis_result.get('url', 'N/A')}"
    )

    # Call the Ollama interface to get SEO suggestions.
    suggestions = get_seo_suggestions(current_seo_data)

    logger.info(
        f"Received SEO improvement suggestions for URL: {analysis_result.get('url', 'N/A')}"
    )
    return suggestions
