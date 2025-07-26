# Python version of the robot actions and tool list

# Dictionary of robot actions with sleep time, action commands, and name
ACTIONS = {
    "back_fast": {"sleep_time": 4.5, "action": ["2", "4"], "name": "back_fast"},
    "bow": {"sleep_time": 4, "action": ["10", "1"], "name": "bow"},
    "chest": {"sleep_time": 9, "action": ["12", "1"], "name": "chest"},
    # 基础移动
    "back_fast": {"sleep_time": 4.5, "action": ["2", "4"], "name": "back_fast"},
    "go_forward": {"sleep_time": 3.5, "action": ["1", "4"], "name": "go_forward"},
    "left_move_fast": {"sleep_time": 3, "action": ["3", "4"], "name": "left_move_fast"},
    "right_move_fast": {"sleep_time": 3, "action": ["4", "4"], "name": "right_move_fast"},
    "turn_left": {"sleep_time": 4, "action": ["7", "4"], "name": "turn_left"},
    "turn_right": {"sleep_time": 4, "action": ["8", "4"], "name": "turn_right"},
    "stop": {"sleep_time": 1, "action": ["24", "2"], "name": "stop"},
    
    # 姿态动作
    "stand": {"sleep_time": 2, "action": ["stand"], "name": "stand"},
    "sit": {"sleep_time": 2, "action": ["sit"], "name": "sit"},
    "lie_down": {"sleep_time": 3, "action": ["lie_down"], "name": "lie_down"},
    
    # 互动动作
    "bow": {"sleep_time": 4, "action": ["bow"], "name": "bow"},
    "wave": {"sleep_time": 3.5, "action": ["wave"], "name": "wave"},
    "shake_hands": {"sleep_time": 4, "action": ["shake_hands"], "name": "shake_hands"},
    "nod": {"sleep_time": 2, "action": ["nod"], "name": "nod"},
    
    # 运动动作
    "boxing": {"sleep_time": 5, "action": ["boxing"], "name": "boxing"},
    "push_ups": {"sleep_time": 8, "action": ["push-up01"], "name": "push_ups"},
    "moonwalk": {"sleep_time": 6, "action": ["moonwalk"], "name": "moonwalk"},
}

# List of tools with names and descriptions
TOOL_LIST = [
    # 基础移动
    {"name": "back_fast", "description": "Command the robot to move backward quickly."},
    {"name": "go_forward", "description": "Command the robot to move forward."},
    {"name": "left_move_fast", "description": "Command the robot to move left quickly."},
    {"name": "right_move_fast", "description": "Command the robot to move right quickly."},
    {"name": "turn_left", "description": "Command the robot to turn left."},
    {"name": "turn_right", "description": "Command the robot to turn right."},
    {"name": "stop", "description": "Command the robot to stop moving."},
    
    # 姿态动作
    {"name": "stand", "description": "Command the robot to stand up."},
    {"name": "sit", "description": "Command the robot to sit down."},
    {"name": "lie_down", "description": "Command the robot to lie down."},
    {"name": "2_legs_stand", "description": "Command the robot to stand on two legs."},
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
    {"name": "push_ups", "description": "Command the robot to do push-ups."},
    {"name": "push_up", "description": "Command the robot to do a push-up."},
    {"name": "press_up", "description": "Command the robot to do press-ups."},
    {"name": "moonwalk", "description": "Command the robot to perform moonwalk dance."},
    {"name": "spacewalk", "description": "Command the robot to perform spacewalk dance."},
    {"name": "jump", "description": "Command the robot to jump."},
    {"name": "stretch", "description": "Command the robot to stretch."},
    {"name": "pee", "description": "Command the robot to perform pee action."},
    {"name": "demo", "description": "Command the robot to perform demo sequence."},
    
    # 特殊动作
    {"name": "up_stairs_3_5cm", "description": "Command the robot to go up 3.5cm stairs."},
    {"name": "kick_ball_left", "description": "Command the robot to kick ball with left leg."},
    {"name": "kick_ball_right", "description": "Command the robot to kick ball with right leg."},
    {"name": "Clamping", "description": "Command the robot to perform clamping action."}
    {
        "name": "dance_eight",
        "description": "Command the robot to perform dance eight.",
    },
    {
        "name": "dance_five",
        "description": "Command the robot to perform dance five.",
    },
    {
        "name": "dance_four",
        "description": "Command the robot to perform dance four.",
    },
    {
        "name": "dance_nine",
        "description": "Command the robot to perform dance nine.",
    },
    {
        "name": "dance_seven",
        "description": "Command the robot to perform dance seven.",
    },
    {"name": "dance_six", "description": "Command the robot to perform dance six."},
    {"name": "dance_ten", "description": "Command the robot to perform dance ten."},
    {
        "name": "dance_three",
        "description": "Command the robot to perform dance three.",
    },
    {"name": "dance_two", "description": "Command the robot to perform dance two."},
    {
        "name": "go_forward",
        "description": "Command the robot to move forward in the direction it is currently facing.",
    },
    {
        "name": "kung_fu",
        "description": "Command the robot to perform kung fu moves.",
    },
    {
        "name": "left_kick",
        "description": "Command the robot to perform a left kick.",
    },
    {
        "name": "left_move_fast",
        "description": "Command the robot to move left quickly.",
    },
    {
        "name": "left_shot_fast",
        "description": "Command the robot to perform a fast left punch.",
    },
    {
        "name": "left_uppercut",
        "description": "Command the robot to perform a left uppercut.",
    },
    {"name": "push_ups", "description": "Command the robot to perform push-ups."},
    {
        "name": "right_kick",
        "description": "Command the robot to perform a right kick.",
    },
    {
        "name": "right_move_fast",
        "description": "Command the robot to move right quickly.",
    },
    {
        "name": "right_shot_fast",
        "description": "Command the robot to perform a fast right punch.",
    },
    {
        "name": "right_uppercut",
        "description": "Command the robot to perform a right uppercut.",
    },
    {"name": "sit_ups", "description": "Command the robot to perform sit-ups."},
    {"name": "squat", "description": "Command the robot to squat down."},
    {
        "name": "squat_up",
        "description": "Command the robot to stand up from a squat.",
    },
    {
        "name": "stand",
        "description": "Command the robot to stand up and maintain a standing position.",
    },
    {
        "name": "stand_up_back",
        "description": "Command the robot to stand up from the back.",
    },
    {
        "name": "stand_up_front",
        "description": "Command the robot to stand up from the front.",
    },
    {
        "name": "stepping",
        "description": "Command the robot to perform stepping motions.",
    },
    {
        "name": "stop",
        "description": "Command the robot to perform stepping motions.",
    },
    {"name": "turn_left", "description": "Command the robot to turn left."},
    {"name": "turn_right", "description": "Command the robot to turn right."},
    {"name": "twist", "description": "Command the robot to twist its body."},
    {"name": "wave", "description": "Command the robot to wave its hand."},
    {
        "name": "weightlifting",
        "description": "Command the robot to perform weightlifting.",
    },
    {
        "name": "wing_chun",
        "description": "Command the robot to perform Wing Chun moves.",
    },
]

# Default tool schema for input validation
DEFAULT_TOOL_SCHEMA = {
    "type": "object",
    "properties": {},
    "required": [],
}  # Python equivalent of DefaultToolSchema

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
