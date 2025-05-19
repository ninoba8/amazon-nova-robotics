import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from time import sleep
from typing import Any, Dict

import awsgi2
import boto3
from botocore.config import Config
from flask import Flask, jsonify, render_template, request

from database import get_robot, upsert_robot, delete_robot, list_robots


app = Flask(__name__)

# Initialize AWS clients with retry configuration
iot_client = boto3.client(
    "iot-data",
    config=Config(retries={"max_attempts": 3, "mode": "standard"}),
)
# Use environment variable or default to us-east-1 only as fallback
AWS_BEDROCK_REGION = os.getenv("AWS_BEDROCK_REGION", "us-east-1")
bedrock_runtime = boto3.client(
    "bedrock-runtime",
    config=Config(
        region_name=AWS_BEDROCK_REGION, retries={"max_attempts": 3, "mode": "standard"}
    ),
)


# Session storage for Nova conversation tracking
active_sessions = {}


@app.route("/index")
def home():
    return render_template("index.html")


# List of available robot actions with metadata
actions: Dict[str, Dict[str, Any]] = {
    "back_fast": {"sleep_time": 4.5, "action": ["2", "4"], "name": "back_fast"},
    "bow": {"sleep_time": 4, "action": ["10", "1"], "name": "bow"},
    "chest": {"sleep_time": 9, "action": ["12", "1"], "name": "chest"},
    "dance_eight": {"sleep_time": 85, "action": ["42", "1"], "name": "dance_eight"},
    "dance_five": {"sleep_time": 59, "action": ["39", "1"], "name": "dance_five"},
    "dance_four": {"sleep_time": 59, "action": ["38", "1"], "name": "dance_four"},
    "dance_nine": {"sleep_time": 84, "action": ["43", "1"], "name": "dance_nine"},
    "dance_seven": {"sleep_time": 67, "action": ["41", "1"], "name": "dance_seven"},
    "dance_six": {"sleep_time": 69, "action": ["40", "1"], "name": "dance_six"},
    "dance_ten": {"sleep_time": 85, "action": ["44", "1"], "name": "dance_ten"},
    "dance_three": {"sleep_time": 70, "action": ["37", "1"], "name": "dance_three"},
    "dance_two": {"sleep_time": 52, "action": ["36", "1"], "name": "dance_two"},
    "go_forward": {"sleep_time": 3.5, "action": ["1", "4"], "name": "go_forward"},
    "kung_fu": {"sleep_time": 2, "action": ["46", "2"], "name": "kung_fu"},
    "left_kick": {"sleep_time": 2, "action": ["18", "1"], "name": "left_kick"},
    "left_move_fast": {"sleep_time": 3, "action": ["3", "4"], "name": "left_move_fast"},
    "left_shot_fast": {
        "sleep_time": 4,
        "action": ["13", "1"],
        "name": "left_shot_fast",
    },
    "left_uppercut": {"sleep_time": 2, "action": ["16", "1"], "name": "left_uppercut"},
    "push_ups": {"sleep_time": 9, "action": ["5", "1"], "name": "push_ups"},
    "right_kick": {"sleep_time": 2, "action": ["19", "1"], "name": "right_kick"},
    "right_move_fast": {
        "sleep_time": 3,
        "action": ["4", "4"],
        "name": "right_move_fast",
    },
    "right_shot_fast": {
        "sleep_time": 4,
        "action": ["14", "1"],
        "name": "right_shot_fast",
    },
    "right_uppercut": {
        "sleep_time": 2,
        "action": ["17", "1"],
        "name": "right_uppercut",
    },
    "sit_ups": {"sleep_time": 12, "action": ["6", "1"], "name": "sit_ups"},
    "squat": {"sleep_time": 1, "action": ["11", "1"], "name": "squat"},
    "squat_up": {"sleep_time": 6, "action": ["45", "1"], "name": "squat_up"},
    "stand": {"sleep_time": 1, "action": ["0", "1"], "name": "站立"},
    "stand_up_back": {"sleep_time": 5, "action": ["21", "1"], "name": "stand_up_back"},
    "stand_up_front": {
        "sleep_time": 5,
        "action": ["20", "1"],
        "name": "stand_up_front",
    },
    "stepping": {"sleep_time": 3, "action": ["24", "2"], "name": "stepping"},
    "stop": {"sleep_time": 3, "action": ["24", "2"], "name": "stop"},
    "turn_left": {"sleep_time": 4, "action": ["7", "4"], "name": "turn_left"},
    "turn_right": {"sleep_time": 4, "action": ["8", "4"], "name": "turn_right"},
    "twist": {"sleep_time": 4, "action": ["22", "1"], "name": "twist"},
    "wave": {"sleep_time": 3.5, "action": ["9", "1"], "name": "wave"},
    "weightlifting": {"sleep_time": 9, "action": ["35", "1"], "name": "weightlifting"},
    "wing_chun": {"sleep_time": 2, "action": ["15", "1"], "name": "wing_chun"},
}


def execute_robot_action(message, selected_robot):
    """Execute a robot action by publishing to the appropriate IoT topic"""
    if selected_robot == "all":

        def publish_to_robot(robot_id):
            topic = f"robot_{robot_id}/topic"
            try:
                iot_client.publish(
                    topic=topic,
                    qos=0,
                    retain=False,
                    payload=bytes(f'{{ "toolName": "{message}" }}', "utf-8"),
                )
                print(f"Published to {topic}: {message}")
                return True
            except Exception as e:
                print(f"Error publishing to {topic}: {e}")
                return False

        with ThreadPoolExecutor() as executor:
            futures = list(executor.map(publish_to_robot, range(1, 7)))
            return all(futures)  # Return True if all succeeded, False otherwise
    else:
        topic = f"{selected_robot}/topic"
        try:
            iot_client.publish(
                topic=topic,
                qos=0,
                retain=False,
                payload=bytes(f'{{ "toolName": "{message}" }}', "utf-8"),
            )
            return True
        except Exception as e:
            print(f"Error publishing to {topic}: {e}")
            return False


def process_actions(actions_to_execute, selected_robot):
    """Process a list of actions sequentially"""
    results = []
    for action in actions_to_execute:
        if action in actions:
            success = execute_robot_action(action, selected_robot)
            results.append(
                {"action": action, "success": success, "name": actions[action]["name"]}
            )
            sleep(0.1)
        else:
            results.append(
                {"action": action, "success": False, "error": "Invalid action"}
            )
    return results


# Nova Chatbot system prompt
SYSTEM_PROMPT = f"""
You are a helpful robot assistant. You control various robots that can perform physical actions.

<backgound></backgound>

Available commands are: {', '.join(actions.keys())}.

When a user asks you to perform an action, respond in a friendly way and execute the command in order.
If you need to execute multiple actions, separate them by commas, and don't said anything else.
If a user asks for something that's not a valid action, politely inform them which actions are available.
"""


@app.route("/chat", methods=["POST"])
def chat():
    """Handle chat requests with Nova Chatbot integration"""
    user_message = request.json.get("message")
    selected_robot = request.json.get("robot")
    session_id = request.json.get("session_id", str(uuid.uuid4()))


    context = get_robot(selected_robot)
    if context:
        name = context.get("robot_name")
        context = context.get("context")
        system_prompt = SYSTEM_PROMPT.replace(
            "<backgound></backgound>", 
            f"""
<backgound>Your Name:{name} 
Backgound: {context}
</backgound>
            """
        )
    else:
        system_prompt = SYSTEM_PROMPT.replace("<backgound></backgound>", "")


    # Create or retrieve session history
    if session_id not in active_sessions:
        active_sessions[session_id] = []

    # Add user message to history
    active_sessions[session_id].append({"role": "user", "content": user_message})

    # Convert message history to the format expected by converse API
    messages = []
    for msg in active_sessions[session_id]:
        messages.append({"role": msg["role"], "content": [{"text": msg["content"]}]})

    system = [{"text": system_prompt}]

    # Call Nova via Bedrock API using converse method
    try:
        response = bedrock_runtime.converse(
            modelId="us.amazon.nova-pro-v1:0",  # Updated to use nova-pro
            messages=messages,
            system=system,
            inferenceConfig={"maxTokens": 1024, "temperature": 0.7, "topP": 0.9},
            additionalModelRequestFields={"inferenceConfig": {"topK": 20}},
        )

        bot_response = response["output"]["message"]["content"][0]["text"]

        # Add assistant response to history
        active_sessions[session_id].append(
            {"role": "assistant", "content": bot_response}
        )

        # Check if Nova's response contains any of our robot commands
        potential_actions = []
        for word in bot_response.lower().split():
            word = "".join(char for char in word if char.isalnum() or char == "_")
            if word in actions.keys():
                potential_actions.append(word)

        # If comma-separated commands are detected in the user input, prioritize those
        if "," in user_message:
            direct_commands = [item.strip() for item in user_message.split(",")]
            valid_commands = [cmd for cmd in direct_commands if cmd in actions]

            if valid_commands:
                execution_results = process_actions(valid_commands, selected_robot)
                return jsonify(
                    {
                        "response": bot_response,
                        "session_id": session_id,
                        "actions_executed": execution_results,
                    }
                )

        # If Nova identified actions to take, execute them
        if potential_actions:
            execution_results = process_actions(potential_actions, selected_robot)
            return jsonify(
                {
                    "response": bot_response,
                    "session_id": session_id,
                    "actions_executed": execution_results,
                }
            )

        # No actions to execute
        return jsonify({"response": bot_response, "session_id": session_id})

    except Exception as e:
        print(f"Error calling Nova: {str(e)}")
        return (
            jsonify(
                {
                    "response": f"I'm sorry, I encountered an error: {str(e)}",
                    "session_id": session_id,
                }
            ),
            500,
        )

# --- Robot CRUD API ---
@app.route("/robots", methods=["GET"])
def robots_list():
    robots = list_robots()
    return jsonify(robots)

@app.route("/robots/<robot_id>", methods=["GET"])
def robot_get(robot_id):
    robot = get_robot(robot_id)
    if robot:
        return jsonify(robot)
    return jsonify({"error": "Not found"}), 404

@app.route("/robots", methods=["POST"])
def robot_create():
    data = request.json
    robot_id = data.get("id")
    if not robot_id:
        return jsonify({"error": "Missing id"}), 400
    robot = upsert_robot(robot_id, data)
    return jsonify(robot), 201

@app.route("/robots/<robot_id>", methods=["PUT"])
def robot_update(robot_id):
    data = request.json
    print(data)
    robot = upsert_robot(robot_id, data)
    return jsonify(robot)

@app.route("/robots/<robot_id>", methods=["DELETE"])
def robot_delete(robot_id):
    delete_robot(robot_id)
    return jsonify({"deleted": True})

# --- Robot CRUD Page ---
@app.route("/robot")
def robot_page():
    return render_template("robot.html")



def handler(event, context):
    return awsgi2.response(app, event, context)


if __name__ == "__main__":
    app.run(debug=True)
