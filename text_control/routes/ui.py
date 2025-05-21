"""
UI routes - Handles all user interface endpoints
"""
from flask import Blueprint, render_template

# Create a blueprint for the UI routes
ui_bp = Blueprint('ui', __name__)

@ui_bp.route("/")
@ui_bp.route("/index")
def home():
    return render_template("index.html")

@ui_bp.route("/robot")
def robot_page():
    return render_template("robot.html")
