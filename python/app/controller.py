from app.services import OpenAISummarizer
from flask import current_app
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def summarize_pr(pr_description: str) -> str:
   
    try:
        # Validate input
        if not pr_description or not pr_description.strip():
            raise ValueError("PR description cannot be empty")
        
        # Get OpenAI API key from app config
        api_key = current_app.config.get('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OpenAI API key not configured")
        
        # Initialize the summarizer service
        summarizer = OpenAISummarizer(api_key)
        
        # Generate summary
        summary = summarizer.summarize(pr_description)
        
        logger.info(f"Successfully summarized PR description. Original length: {len(pr_description)}, Summary length: {len(summary)}")
        
        return summary
        
    except Exception as e:
        logger.error(f"Error in summarize_pr: {str(e)}")
        raise 