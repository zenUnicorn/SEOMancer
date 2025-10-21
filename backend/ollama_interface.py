# backend/ollama_interface.py

import ollama
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_seo_suggestions(current_seo_data: str, model_name: str = "llama3") -> str:
    """
    Communicates with the Ollama LLM to get SEO suggestions.

    This function sends the current SEO data of a website to a local LLM
    (via Ollama) and asks for suggestions to improve it.

    Args:
        current_seo_data (str): A string containing the current SEO metadata
                                (e.g., title, meta description, headers) of a website.
        model_name (str): The name of the Ollama model to use (e.g., "llama3").
                          Defaults to "llama3".

    Returns:
        str: A string containing the AI-generated SEO suggestions.
             Returns an error message if the communication fails.
    """
    logger.info(f"Requesting SEO suggestions from Ollama model: {model_name}")

    # This is the prompt that will be sent to the LLM. It's designed to give the AI
    # context and a clear task.
    prompt = f"""
    Analyze the following SEO data from a website and provide suggestions for improvement.
    The suggestions should cover the title tag, meta description, and header tags (H1, H2, etc.).
    Provide a concrete, improved version for each tag.

    Current SEO Data:
    {current_seo_data}

    Please return your suggestions in a clear, easy-to-read format.
    For example:
    **Improved Title:** A New, Catchy, SEO-Friendly Title
    **Improved Meta Description:** A compelling meta description that drives clicks.
    **Improved H1:** A clear and concise main heading.
    """

    try:
        # Send the prompt to the Ollama model using the chat client.
        response = ollama.chat(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )
        suggestions = response["message"]["content"]
        logger.info("Successfully received suggestions from Ollama.")
        return suggestions
    except Exception as e:
        # Handle potential errors, such as the Ollama service not being available.
        logger.error(f"Failed to communicate with Ollama: {e}")
        return "Error: Could not retrieve SEO suggestions from the AI model."
