"""
BYOK Provider Validators
Test API keys with minimal provider calls
"""
import os
import logging
import aiohttp
from typing import Tuple

logger = logging.getLogger(__name__)


async def validate_openai_key(api_key: str) -> Tuple[bool, str]:
    """
    Validate OpenAI API key with a minimal test call.
    
    Args:
        api_key: OpenAI API key to validate
        
    Returns:
        Tuple of (is_valid: bool, message: str)
    """
    try:
        async with aiohttp.ClientSession() as session:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            # Use models endpoint - cheap and fast
            async with session.get(
                'https://api.openai.com/v1/models',
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    return True, "OpenAI API key is valid"
                elif response.status == 401:
                    return False, "Invalid OpenAI API key"
                elif response.status == 429:
                    return False, "OpenAI rate limit exceeded. Please try again later."
                else:
                    error_text = await response.text()
                    logger.warning(f"OpenAI validation failed: {response.status} - {error_text}")
                    return False, f"OpenAI API error: {response.status}"
                    
    except aiohttp.ClientError as e:
        logger.error(f"OpenAI validation network error: {str(e)}")
        return False, "Could not connect to OpenAI. Please check your internet connection."
    except Exception as e:
        logger.error(f"OpenAI validation error: {str(e)}")
        return False, f"Validation error: {str(e)}"


async def validate_google_key(api_key: str) -> Tuple[bool, str]:
    """
    Validate Google AI API key with a minimal test call.
    
    Args:
        api_key: Google AI API key to validate
        
    Returns:
        Tuple of (is_valid: bool, message: str)
    """
    try:
        async with aiohttp.ClientSession() as session:
            # Test with a simple models list call
            url = f'https://generativelanguage.googleapis.com/v1beta/models?key={api_key}'
            
            async with session.get(
                url,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    return True, "Google AI API key is valid"
                elif response.status == 400:
                    return False, "Invalid Google AI API key"
                elif response.status == 429:
                    return False, "Google AI rate limit exceeded. Please try again later."
                else:
                    error_text = await response.text()
                    logger.warning(f"Google validation failed: {response.status} - {error_text}")
                    return False, f"Google AI API error: {response.status}"
                    
    except aiohttp.ClientError as e:
        logger.error(f"Google validation network error: {str(e)}")
        return False, "Could not connect to Google AI. Please check your internet connection."
    except Exception as e:
        logger.error(f"Google validation error: {str(e)}")
        return False, f"Validation error: {str(e)}"


async def validate_anthropic_key(api_key: str) -> Tuple[bool, str]:
    """
    Validate Anthropic API key with a minimal test call.
    
    Args:
        api_key: Anthropic API key to validate
        
    Returns:
        Tuple of (is_valid: bool, message: str)
    """
    try:
        async with aiohttp.ClientSession() as session:
            headers = {
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
            
            # Make a minimal completion request
            data = {
                'model': 'claude-3-haiku-20240307',  # Cheapest model
                'max_tokens': 1,
                'messages': [{'role': 'user', 'content': 'Hi'}]
            }
            
            async with session.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=data,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    return True, "Anthropic API key is valid"
                elif response.status == 401:
                    return False, "Invalid Anthropic API key"
                elif response.status == 429:
                    return False, "Anthropic rate limit exceeded. Please try again later."
                else:
                    error_text = await response.text()
                    logger.warning(f"Anthropic validation failed: {response.status} - {error_text}")
                    return False, f"Anthropic API error: {response.status}"
                    
    except aiohttp.ClientError as e:
        logger.error(f"Anthropic validation network error: {str(e)}")
        return False, "Could not connect to Anthropic. Please check your internet connection."
    except Exception as e:
        logger.error(f"Anthropic validation error: {str(e)}")
        return False, f"Validation error: {str(e)}"


def validate_api_key_format(provider: str, api_key: str) -> Tuple[bool, str]:
    """
    Basic format validation before making API calls.
    
    Args:
        provider: 'openai', 'google', or 'anthropic'
        api_key: API key to validate
        
    Returns:
        Tuple of (is_valid: bool, message: str)
    """
    if not api_key or not api_key.strip():
        return False, "API key cannot be empty"
    
    api_key = api_key.strip()
    
    if provider == 'openai':
        if not api_key.startswith('sk-'):
            return False, "OpenAI API keys should start with 'sk-'"
        if len(api_key) < 20:
            return False, "OpenAI API key seems too short"
            
    elif provider == 'google':
        if len(api_key) < 20:
            return False, "Google AI API key seems too short"
            
    elif provider == 'anthropic':
        if not api_key.startswith('sk-ant-'):
            return False, "Anthropic API keys should start with 'sk-ant-'"
        if len(api_key) < 20:
            return False, "Anthropic API key seems too short"
    else:
        return False, f"Unknown provider: {provider}"
    
    return True, "Format looks valid"
