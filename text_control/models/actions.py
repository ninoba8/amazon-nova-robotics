"""
Robot actions module - Contains the available robot actions with metadata
"""

from typing import Any, Dict

# List of available robot actions with metadata
ACTIONS: Dict[str, Dict[str, Any]] = {
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


def get_available_actions():
    """Return a list of available action names"""
    return list(ACTIONS.keys())


def get_action_metadata(action_name: str) -> Dict[str, Any]:
    """Return metadata for a specific action"""
    return ACTIONS.get(action_name, {})
