"""
BYOK Encryption Utilities
Provides AES-256-GCM encryption/decryption for API keys
"""
import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
import logging

logger = logging.getLogger(__name__)

# Master key for encrypting user API keys
BYOK_MASTER_KEY = None


def validate_master_key():
    """
    Validate BYOK_MASTER_KEY on server boot.
    Fails fast if missing or invalid.
    """
    global BYOK_MASTER_KEY
    
    key_hex = os.getenv('BYOK_MASTER_KEY')
    
    if not key_hex:
        raise ValueError(
            "BYOK_MASTER_KEY environment variable is required. "
            "Generate with: openssl rand -hex 32"
        )
    
    try:
        # Convert hex string to bytes
        key_bytes = bytes.fromhex(key_hex)
    except ValueError:
        raise ValueError(
            "BYOK_MASTER_KEY must be a valid hex string. "
            "Generate with: openssl rand -hex 32"
        )
    
    if len(key_bytes) != 32:
        raise ValueError(
            f"BYOK_MASTER_KEY must be 32 bytes (64 hex chars). "
            f"Got {len(key_bytes)} bytes. "
            "Generate with: openssl rand -hex 32"
        )
    
    BYOK_MASTER_KEY = key_bytes
    logger.info("BYOK master key validated successfully")


def encrypt_api_key(plaintext: str) -> dict:
    """
    Encrypt an API key using AES-256-GCM.
    
    Args:
        plaintext: The API key to encrypt
        
    Returns:
        dict with keys: ciphertext, iv, tag (all base64 encoded)
        
    Raises:
        ValueError: If master key not initialized
    """
    if BYOK_MASTER_KEY is None:
        raise ValueError("BYOK master key not initialized. Call validate_master_key() first.")
    
    # Generate random 96-bit IV (12 bytes) for GCM
    iv = os.urandom(12)
    
    # Create AESGCM cipher
    aesgcm = AESGCM(BYOK_MASTER_KEY)
    
    # Encrypt and get ciphertext with auth tag
    # GCM mode returns ciphertext + 16-byte auth tag concatenated
    ciphertext_with_tag = aesgcm.encrypt(iv, plaintext.encode('utf-8'), None)
    
    # Split ciphertext and tag
    ciphertext = ciphertext_with_tag[:-16]
    tag = ciphertext_with_tag[-16:]
    
    # Return base64 encoded values
    return {
        'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
        'iv': base64.b64encode(iv).decode('utf-8'),
        'tag': base64.b64encode(tag).decode('utf-8')
    }


def decrypt_api_key(ciphertext_b64: str, iv_b64: str, tag_b64: str) -> str:
    """
    Decrypt an API key using AES-256-GCM.
    
    Args:
        ciphertext_b64: Base64 encoded ciphertext
        iv_b64: Base64 encoded IV
        tag_b64: Base64 encoded authentication tag
        
    Returns:
        Decrypted API key as string
        
    Raises:
        ValueError: If master key not initialized or decryption fails
        cryptography.exceptions.InvalidTag: If auth tag validation fails (tampered data)
    """
    if BYOK_MASTER_KEY is None:
        raise ValueError("BYOK master key not initialized. Call validate_master_key() first.")
    
    try:
        # Decode from base64
        ciphertext = base64.b64decode(ciphertext_b64)
        iv = base64.b64decode(iv_b64)
        tag = base64.b64decode(tag_b64)
        
        # Concatenate ciphertext and tag (GCM expects them together)
        ciphertext_with_tag = ciphertext + tag
        
        # Create AESGCM cipher
        aesgcm = AESGCM(BYOK_MASTER_KEY)
        
        # Decrypt and verify auth tag
        plaintext_bytes = aesgcm.decrypt(iv, ciphertext_with_tag, None)
        
        return plaintext_bytes.decode('utf-8')
        
    except Exception as e:
        logger.error(f"Decryption failed: {str(e)}")
        raise ValueError(f"Failed to decrypt API key: {str(e)}")


def test_encryption_roundtrip():
    """
    Test encryption and decryption roundtrip.
    Used for unit testing.
    """
    test_key = "sk-test1234567890abcdefghijklmnopqrstuvwxyz"
    
    # Encrypt
    encrypted = encrypt_api_key(test_key)
    
    # Decrypt
    decrypted = decrypt_api_key(
        encrypted['ciphertext'],
        encrypted['iv'],
        encrypted['tag']
    )
    
    assert decrypted == test_key, "Encryption roundtrip failed"
    logger.info("Encryption roundtrip test passed")
    return True
