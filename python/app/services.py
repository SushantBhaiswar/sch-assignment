import openai
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class OpenAISummarizer:
    """Service class for summarizing PR descriptions using OpenAI API."""
    
    def __init__(self, api_key: str):
        """
        Initialize the OpenAI summarizer.
        
        Args:
            api_key (str): OpenAI API key
        """
        self.client = openai.OpenAI(api_key=api_key)
    
    def summarize(self, pr_description: str, max_length: int = 200) -> str:
        """
        Summarize a PR description using OpenAI API.
        
        Args:
            pr_description (str): The PR description to summarize
            max_length (int): Maximum length of the summary
            
        Returns:
            str: The summarized description
        """
        try:
            # Create the prompt for summarization
            prompt = f"""
            Please summarize the following Pull Request description in a concise and clear manner.
            Focus on the key changes, improvements, and important details.
            Keep the summary under {max_length} characters.
            
            PR Description:
            {pr_description}
            
            Summary:
            """
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that summarizes Pull Request descriptions. Provide clear, concise summaries that highlight the key changes and improvements."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=300,
                temperature=0.3
            )
            console.log(response)
            # Extract the summary from the response
            summary = response.choices[0].message.content.strip()
            
            # Ensure the summary doesn't exceed the max length
            if len(summary) > max_length:
                summary = summary[:max_length-3] + "..."
            
            logger.info(f"Successfully generated summary using OpenAI API")
            return summary
            
        except openai.AuthenticationError:
            logger.error("OpenAI API authentication failed. Please check your API key.")
            raise ValueError("Invalid OpenAI API key")
        except openai.RateLimitError:
            logger.error("OpenAI API rate limit exceeded.")
            raise ValueError("OpenAI API rate limit exceeded. Please try again later.")
        except openai.APIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise ValueError(f"OpenAI API error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in OpenAI summarization: {str(e)}")
            raise ValueError(f"Failed to summarize PR description: {str(e)}")

class SimpleSummarizer:
    """Fallback summarizer that uses simple text processing when OpenAI is not available."""
    
    def __init__(self):
        pass
    
    def summarize(self, pr_description: str, max_length: int = 200) -> str:
        """
        Simple summarization using text processing.
        
        Args:
            pr_description (str): The PR description to summarize
            max_length (int): Maximum length of the summary
            
        Returns:
            str: The summarized description
        """
        # Remove extra whitespace and newlines
        cleaned_text = ' '.join(pr_description.split())
        
        # Simple truncation with word boundary
        if len(cleaned_text) <= max_length:
            return cleaned_text
        
        # Truncate to max_length and find the last complete word
        truncated = cleaned_text[:max_length-3]
        last_space = truncated.rfind(' ')
        
        if last_space > 0:
            summary = truncated[:last_space] + "..."
        else:
            summary = truncated + "..."
        
        return summary 