"""
Error handlers for the Flask application
"""

from flask import Blueprint, jsonify

# Create a blueprint for the error handlers
errors_bp = Blueprint("errors", __name__)


@errors_bp.app_errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request", "message": str(error)}), 400


@errors_bp.app_errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found", "message": str(error)}), 404


@errors_bp.app_errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method not allowed", "message": str(error)}), 405


@errors_bp.app_errorhandler(500)
def internal_server_error(error):
    return jsonify({"error": "Internal server error", "message": str(error)}), 500


def register_error_handlers(app):
    """Register error handlers with the Flask app"""
    app.register_blueprint(errors_bp)
