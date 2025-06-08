"""
Configuration settings for the application
"""

import os

# AWS Bedrock settings
AWS_BEDROCK_REGION = os.getenv("AWS_BEDROCK_REGION", "us-east-1")
NOVA_MODEL_ID = "us.amazon.nova-pro-v1:0"

# Application settings
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
