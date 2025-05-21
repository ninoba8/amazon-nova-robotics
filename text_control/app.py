try:
    import awsgi2
    from flask import Flask
    
    from config import DEBUG

    # Initialize the Flask application
    app = Flask(__name__)
except ImportError as e:
    print(f"Error importing required modules: {e}")
    print("Please install all required dependencies with: pip install -r requirements.txt")
    import sys
    sys.exit(1)

# Import and register blueprints after app is created to avoid circular imports
from routes.api import api_bp
from routes.ui import ui_bp
from errors import register_error_handlers

# Register the blueprints
app.register_blueprint(api_bp)
app.register_blueprint(ui_bp)

# Register error handlers
register_error_handlers(app)




def handler(event, context):
    """AWS Lambda handler for the Flask application"""
    return awsgi2.response(app, event, context)


if __name__ == "__main__":
    app.run(debug=DEBUG)
