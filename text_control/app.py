import awsgi2
from time import sleep
from typing import Any, Dict
from flask import Flask, request, jsonify, render_template
import boto3
import json
import uuid
from concurrent.futures import ThreadPoolExecutor
from botocore.config import Config

app = Flask(__name__)

# Initialize AWS clients with retry configuration
config = Config(
    region_name='us-east-1',
    retries={
        'max_attempts': 3,
        'mode': 'standard'
    }
)

iot_client = boto3.client('iot-data', config=config)
bedrock_runtime = boto3.client('bedrock-runtime', config=config)

# Endpoint for IoT connectivity
input_endpoint = "a1qlex7vqi1791-ats.iot.us-east-1.amazonaws.com"

# Session storage for Nova conversation tracking
active_sessions = {}

@app.route('/index')
def home():
    return render_template('index.html')

# List of available robot actions with metadata
actions: Dict[str, Dict[str, Any]] = {
    'stand': {'sleep_time': 1, 'action': ['0', '1'], 'name': '站立'},
    'go_forward': {'sleep_time': 3.5, 'action': ['1', '4'], 'name': '向前走'},
    'back_fast': {'sleep_time': 4.5, 'action': ['2', '4'], 'name': '向後退'},
    'left_move_fast': {'sleep_time': 3, 'action': ['3', '4'], 'name': '向左移'},
    'right_move_fast': {'sleep_time': 3, 'action': ['4', '4'], 'name': '向右移'},
    'sit_ups': {'sleep_time': 12, 'action': ['6', '1'], 'name': '仰臥起坐'},
    'turn_left': {'sleep_time': 4, 'action': ['7', '4'], 'name': '向左轉'},
    'turn_right': {'sleep_time': 4, 'action': ['8', '4'], 'name': '向右轉'},
    'wave': {'sleep_time': 3.5, 'action': ['9', '1'], 'name': '揮手'},
    'bow': {'sleep_time': 4, 'action': ['10', '1'], 'name': '鞠躬'},
    'squat': {'sleep_time': 1, 'action': ['11', '1'], 'name': '蹲下'},
    'chest': {'sleep_time': 9, 'action': ['12', '1'], 'name': '胸部運動'},
    'left_shot_fast': {'sleep_time': 4, 'action': ['13', '1'], 'name': '左拳'},
    'right_shot_fast': {'sleep_time': 4, 'action': ['14', '1'], 'name': '右拳'},
    'wing_chun': {'sleep_time': 2, 'action': ['15', '1'], 'name': '詠春'},
    'left_uppercut': {'sleep_time': 2, 'action': ['16', '1'], 'name': '左勾拳'},
    'right_uppercut': {'sleep_time': 2, 'action': ['17', '1'], 'name': '右勾拳'},
    'left_kick': {'sleep_time': 2, 'action': ['18', '1'], 'name': '左踢'},
    'right_kick': {'sleep_time': 2, 'action': ['19', '1'], 'name': '右踢'},
    'stand_up_front': {'sleep_time': 5, 'action': ['20', '1'], 'name': '前方起身'},
    'stand_up_back': {'sleep_time': 5, 'action': ['21', '1'], 'name': '後方起身'},
    'twist': {'sleep_time': 4, 'action': ['22', '1'], 'name': '扭腰'},
    'stand_slow': {'sleep_time': 1, 'action': ['23', '1'], 'name': '緩慢站立'},
    'stepping': {'sleep_time': 3, 'action': ['24', '2'], 'name': '踏步'}
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
                    payload=bytes(f'{{ "toolName": "{message}" }}', 'utf-8')
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
                payload=bytes(f'{{ "toolName": "{message}" }}', 'utf-8')
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
            results.append({
                "action": action,
                "success": success,
                "name": actions[action]["name"]
            })
            sleep(0.1)
        else:
            results.append({
                "action": action,
                "success": False,
                "error": "Invalid action"
            })
    return results

# Nova Chatbot system prompt
SYSTEM_PROMPT = """
You are a helpful robot assistant. You control various robots that can perform physical actions.
Available commands are: stand, go_forward, back_fast, left_move_fast, right_move_fast, sit_ups, 
turn_left, turn_right, wave, bow, squat, chest, left_shot_fast, right_shot_fast, wing_chun, 
left_uppercut, right_uppercut, left_kick, right_kick, stand_up_front, stand_up_back, twist, 
stand_slow, and stepping.

When a user asks you to perform an action, respond in a friendly way and execute the command.
If you need to execute multiple actions, separate them by commas.
If a user asks for something that's not a valid action, politely inform them which actions are available.
"""

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests with Nova Chatbot integration"""
    user_message = request.json.get('message')
    selected_robot = request.json.get('robot')
    session_id = request.json.get('session_id', str(uuid.uuid4()))
    
    # Create or retrieve session history
    if session_id not in active_sessions:
        active_sessions[session_id] = []

    # Add user message to history
    active_sessions[session_id].append({"role": "user", "content": user_message})
    
    # Convert message history to the format expected by converse API
    messages = []
    for msg in active_sessions[session_id]:
        messages.append({
            "role": msg["role"],
            "content": [{"text": msg["content"]}]
        })
    
    system = [{"text": SYSTEM_PROMPT}]
    
    # Call Nova via Bedrock API using converse method
    try:
        response = bedrock_runtime.converse(
            modelId="us.amazon.nova-lite-v1:0",  # Updated to use nova-lite
            messages=messages,
            system=system,
            inferenceConfig={
                "maxTokens": 1024,
                "temperature": 0.7,
                "topP": 0.9
            },
            additionalModelRequestFields={
                "inferenceConfig": {
                    "topK": 20
                }
            }
        )
        
        bot_response = response["output"]["message"]["content"][0]["text"]
        
        # Add assistant response to history
        active_sessions[session_id].append({"role": "assistant", "content": bot_response})
        
        # Check if Nova's response contains any of our robot commands
        potential_actions = []
        for action in actions.keys():
            if action in bot_response.lower():
                potential_actions.append(action)
        
        # If comma-separated commands are detected in the user input, prioritize those
        if ',' in user_message:
            direct_commands = [item.strip() for item in user_message.split(',')]
            valid_commands = [cmd for cmd in direct_commands if cmd in actions]
            
            if valid_commands:
                execution_results = process_actions(valid_commands, selected_robot)
                return jsonify({
                    "response": bot_response,
                    "session_id": session_id,
                    "actions_executed": execution_results
                })
        
        # If Nova identified actions to take, execute them
        if potential_actions:
            execution_results = process_actions(potential_actions, selected_robot)
            return jsonify({
                "response": bot_response,
                "session_id": session_id,
                "actions_executed": execution_results
            })
            
        # No actions to execute
        return jsonify({
            "response": bot_response,
            "session_id": session_id
        })
        
    except Exception as e:
        print(f"Error calling Nova: {str(e)}")
        return jsonify({"response": f"I'm sorry, I encountered an error: {str(e)}", "session_id": session_id}), 500

def handler(event, context):
    return awsgi2.response(app, event, context)

if __name__ == '__main__':
    app.run(debug=True)