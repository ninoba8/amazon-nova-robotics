import os
import logging
import requests
import time
import queue
import threading
from uuid import uuid4
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# 動作配置字典
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

idle_action ={'name': None, 'sleep_time': 0}

class ActionExecutor:
    def __init__(self):
        """Initialize the ActionExecutor with a queue and a consumer thread."""
        self.logger = logging.getLogger(__name__)
        self.action_queue = queue.Queue()
        self.current_action: Dict[str, Any] = idle_action
        self.is_running = False
        self.queue_lock = threading.Lock()
        self.consumer_thread = threading.Thread(target=self._consumer, daemon=True)
        self.consumer_thread.start()

    def _run_action(self, p1: str, p2: str) -> Optional[Dict[str, Any]]:
        """Send a request to execute an action."""
        headers = {"deviceid": "1732853986186"}
        data = {
            "id": "1732853986186",
            "jsonrpc": "2.0",
            "method": "RunAction",
            "params": [p1, p2]
        }
        try:
            response = requests.post("http://localhost:9030/", headers=headers, json=data)
            response.raise_for_status()
            self.logger.info(f"Action run_action({p1}, {p2}) successful. Response: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error running action run_action({p1}, {p2})")
            return None

    def _execute_action(self, action_item: Dict[str, Any]) -> None:
        """Execute a single action from the queue."""
        action_name = action_item['name']
        action = actions[action_name]
        self.current_action = {'name': action['name'], 'sleep_time': action['sleep_time']}
        try:
            self._run_action(action['action'][0], action['action'][1])
            time.sleep(action['sleep_time'])
        except Exception as e:
            self.logger.error(f"Error executing action {action_name}: {e}")
        finally:
            self._remove_action_by_id(action_item['id'])
            self.current_action = idle_action

    def _remove_action_by_id(self, action_id: str) -> None:
        """Remove an action from the queue by its ID."""
        with self.queue_lock:
            temp_list = list(self.action_queue.queue)
            filtered = [item for item in temp_list if item['id'] != action_id]
            self._replace_queue(filtered)

    def _replace_queue(self, items: list) -> None:
        """Replace the current queue with a new list of items."""
        self.action_queue.queue.clear()
        for item in items:
            self.action_queue.put(item)

    def _consumer(self) -> None:
        """Continuously consume actions from the queue and execute them."""
        while True:
            try:
                action_item = self.action_queue.get(timeout=1)
                action_name = action_item['name']

                if action_name == "stop":
                    self.logger.error("Received stop command, stopping action execution.")
                    self.clear_action_queue()
                    self.current_action = idle_action
                    self.is_running = False
                    continue        

                self.is_running = True
                self._execute_action(action_item)
                time.sleep(0.5)
            except queue.Empty:
                self.is_running = False
                time.sleep(1)

    def add_action_to_queue(self, action_name: str) -> None:
        """Add a new action to the queue."""
        if action_name not in actions:
            self.logger.error(f"Action '{action_name}' not found in actions dictionary.")
            return
        action_id = str(uuid4())
        with self.queue_lock:
            self.action_queue.put({'id': action_id, 'name': action_name})

    def remove_action_from_queue(self, action_id: str) -> None:
        """Remove an action from the queue by its ID."""
        self._remove_action_by_id(action_id)

    def clear_action_queue(self) -> None:
        """Clear all actions from the queue."""
        with self.queue_lock:
            self.action_queue.queue.clear()

    def get_queue_status(self) -> Dict[str, Any]:
        """Get the current status of the action queue."""
        with self.queue_lock:
            queue_items = list(self.action_queue.queue)
        return {
            'queue': queue_items,
            'current_action': self.current_action,
            'is_running': self.is_running
        }