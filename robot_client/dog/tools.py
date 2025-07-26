# Python version of the robot actions and tool list

# Dictionary of robot actions with sleep time, action commands, and name
ACTIONS = {
    # 基础移动
    "back_fast": {"sleep_time": 4.5, "action": ["2", "4"], "name": "back_fast"},
    "go_forward": {"sleep_time": 3.5, "action": ["1", "4"], "name": "go_forward"},
    "stop": {"sleep_time": 1, "action": ["24", "2"], "name": "stop"},
    
    # 姿态动作
    "stand": {"sleep_time": 2, "action": ["stand"], "name": "stand"},
    "sit": {"sleep_time": 2, "action": ["sit"], "name": "sit"},
    "lie_down": {"sleep_time": 3, "action": ["lie_down"], "name": "lie_down"},

    "look_down": {"sleep_time": 2, "action": ["look_down"], "name": "look_down"},
    
    # 互动动作
    "bow": {"sleep_time": 4, "action": ["bow"], "name": "bow"},
    "wave": {"sleep_time": 3.5, "action": ["wave"], "name": "wave"},
    "shake_hands": {"sleep_time": 4, "action": ["shake_hands"], "name": "shake_hands"},
    "nod": {"sleep_time": 2, "action": ["nod"], "name": "nod"},
    "shake_head": {"sleep_time": 2, "action": ["shake_head"], "name": "shake_head"},
    
    # 运动动作
    "boxing": {"sleep_time": 5, "action": ["boxing"], "name": "boxing"},
    "boxing2": {"sleep_time": 5, "action": ["boxing2"], "name": "boxing2"},
    "moonwalk": {"sleep_time": 6, "action": ["moonwalk"], "name": "moonwalk"},
    "spacewalk": {"sleep_time": 6, "action": ["spacewalk"], "name": "spacewalk"},
    "jump": {"sleep_time": 3, "action": ["jump"], "name": "jump"},
    "stretch": {"sleep_time": 5, "action": ["stretch"], "name": "stretch"},
    "pee": {"sleep_time": 4, "action": ["pee"], "name": "pee"},
    "demo": {"sleep_time": 10, "action": ["demo"], "name": "demo"},
    
    # 特殊动作

    "kick_ball_left": {"sleep_time": 3, "action": ["kick_ball_left"], "name": "kick_ball_left"},
    "kick_ball_right": {"sleep_time": 3, "action": ["kick_ball_right"], "name": "kick_ball_right"},
}

# List of tools with names and descriptions
TOOL_LIST = [
    # 基础移动
    {"name": "back_fast", "description": "Command the robot to move backward quickly."},
    {"name": "go_forward", "description": "Command the robot to move forward."},
    {"name": "stop", "description": "Command the robot to stop moving."},
    
    # 姿态动作
    {"name": "stand", "description": "Command the robot to stand up."},
    {"name": "sit", "description": "Command the robot to sit down."},
    {"name": "lie_down", "description": "Command the robot to lie down."},

    {"name": "look_down", "description": "Command the robot to look down."},
    
    # 互动动作
    {"name": "bow", "description": "Command the robot to bow."},
    {"name": "wave", "description": "Command the robot to wave."},
    {"name": "shake_hands", "description": "Command the robot to shake hands."},
    {"name": "nod", "description": "Command the robot to nod its head."},
    {"name": "shake_head", "description": "Command the robot to shake its head."},
    
    # 运动动作
    {"name": "boxing", "description": "Command the robot to perform boxing moves."},
    {"name": "boxing2", "description": "Command the robot to perform boxing moves (variant 2)."},
    {"name": "moonwalk", "description": "Command the robot to perform moonwalk dance."},
    {"name": "spacewalk", "description": "Command the robot to perform spacewalk dance."},
    {"name": "jump", "description": "Command the robot to jump."},
    {"name": "stretch", "description": "Command the robot to stretch."},
    {"name": "pee", "description": "Command the robot to perform pee action."},
    {"name": "demo", "description": "Command the robot to perform demo sequence."},
    
    # 特殊动作

    {"name": "kick_ball_left", "description": "Command the robot to kick ball with left leg."},
    {"name": "kick_ball_right", "description": "Command the robot to kick ball with right leg."},
]

# Default tool schema for input validation
DEFAULT_TOOL_SCHEMA = {
    "type": "object",
    "properties": {},
    "required": [],
}

# Convert tool list to toolSpec format
TOOLS = [
    {
        "toolSpec": {
            "name": tool["name"],
            "description": tool["description"],
            "inputSchema": {"json": DEFAULT_TOOL_SCHEMA},
        }
    }
    for tool in TOOL_LIST
]