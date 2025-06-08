try:
    import awsgi2
    from config import DEBUG
    from flask import Flask

    # Initialize the Flask application
    app = Flask(__name__)
except ImportError as e:
    print(f"Error importing required modules: {e}")
    print(
        "Please install all required dependencies with: pip install -r requirements.txt"
    )
    import sys

    sys.exit(1)

from errors import register_error_handlers

# Import and register blueprints after app is created to avoid circular imports
from routes.api import api_bp
from routes.ui import ui_bp

# Register the blueprints
app.register_blueprint(api_bp)
app.register_blueprint(ui_bp)

# Register error handlers
register_error_handlers(app)


def handler(event, context):
    """AWS Lambda handler for the Flask application"""
    return awsgi2.response(app, event, context)


if __name__ == "__main__":
    # app.run(debug=DEBUG)
    app.run(host="0.0.0.0", ebug=DEBUG)
