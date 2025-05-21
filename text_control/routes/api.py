"""
API routes - Handles all API endpoints
"""

import uuid

from flask import Blueprint, jsonify, request
from services.chat_service import extract_actions_from_response, get_chat_response
from services.database_service import delete_robot, get_robot, list_robots, upsert_robot
from services.robot_service import process_actions

# Create a blueprint for the API routes
api_bp = Blueprint("api", __name__)


@api_bp.route("/chat", methods=["POST"])
def chat():
    """Handle chat requests with Nova Chatbot integration"""
    user_message = request.json.get("message")
    selected_robot = request.json.get("robot")
    session_id = request.json.get("session_id", str(uuid.uuid4()))

    # Get response from Nova chatbot
    response_data = get_chat_response(user_message, selected_robot, session_id)

    if "error" in response_data:
        return jsonify(response_data), 500

    # Extract actions to execute
    bot_response = response_data["response"]
    actions_to_execute = extract_actions_from_response(bot_response, user_message)

    print(f"Actions to execute: {actions_to_execute}")

    # Execute actions if any were found
    if actions_to_execute:
        execution_results = process_actions(actions_to_execute, selected_robot)
        response_data["actions_executed"] = execution_results

    return jsonify(response_data)


@api_bp.route("/robots", methods=["GET"])
def robots_list():
    robots = list_robots()
    return jsonify(robots)


@api_bp.route("/robots/<robot_id>", methods=["GET"])
def robot_get(robot_id):
    robot = get_robot(robot_id)
    if robot:
        return jsonify(robot)
    return jsonify({"error": "Not found"}), 404


@api_bp.route("/robots", methods=["POST"])
def robot_create():
    data = request.json
    robot_id = data.get("id")
    if not robot_id:
        return jsonify({"error": "Missing id"}), 400
    robot = upsert_robot(robot_id, data)
    return jsonify(robot), 201


@api_bp.route("/robots/<robot_id>", methods=["PUT"])
def robot_update(robot_id):
    data = request.json
    robot = upsert_robot(robot_id, data)
    return jsonify(robot)


@api_bp.route("/robots/<robot_id>", methods=["DELETE"])
def robot_delete(robot_id):
    delete_robot(robot_id)
    return jsonify({"deleted": True})
