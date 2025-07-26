import logging
import queue
import threading
import time
import math
from typing import Any, Dict, Optional
from uuid import uuid4

import rclpy
from rclpy.node import Node
from std_srvs.srv import SetBool
from puppy_control_msgs.msg import Velocity, Pose, Gait
from puppy_control_msgs.srv import SetRunActionName

logger = logging.getLogger(__name__)

# 動作配置字典 (Action configuration dictionary)
actions: Dict[str, Dict[str, Any]] = {
    # 基础移动
    "back_fast": {"sleep_time": 4.5, "action": ["2", "4"], "name": "back_fast", "type": "velocity"},
    "go_forward": {"sleep_time": 3.5, "action": ["1", "4"], "name": "go_forward", "type": "velocity"},
    "left_move_fast": {"sleep_time": 3, "action": ["3", "4"], "name": "left_move_fast", "type": "velocity"},
    "right_move_fast": {"sleep_time": 3, "action": ["4", "4"], "name": "right_move_fast", "type": "velocity"},
    "turn_left": {"sleep_time": 4, "action": ["7", "4"], "name": "turn_left", "type": "velocity"},
    "turn_right": {"sleep_time": 4, "action": ["8", "4"], "name": "turn_right", "type": "velocity"},
    "stop": {"sleep_time": 1, "action": ["24", "2"], "name": "stop", "type": "velocity"},
    
    # 姿态动作
    "stand": {"sleep_time": 2, "action": ["stand"], "name": "stand", "type": "action"},
    "sit": {"sleep_time": 2, "action": ["sit"], "name": "sit", "type": "action"},
    "lie_down": {"sleep_time": 3, "action": ["lie_down"], "name": "lie_down", "type": "action"},
    "2_legs_stand": {"sleep_time": 3, "action": ["2_legs_stand"], "name": "2_legs_stand", "type": "action"},
    "look_down": {"sleep_time": 2, "action": ["look_down"], "name": "look_down", "type": "action"},
    
    # 互动动作
    "bow": {"sleep_time": 4, "action": ["bow"], "name": "bow", "type": "action"},
    "wave": {"sleep_time": 3.5, "action": ["wave"], "name": "wave", "type": "action"},
    "shake_hands": {"sleep_time": 4, "action": ["shake_hands"], "name": "shake_hands", "type": "action"},
    "nod": {"sleep_time": 2, "action": ["nod"], "name": "nod", "type": "action"},
    "shake_head": {"sleep_time": 2, "action": ["shake_head"], "name": "shake_head", "type": "action"},
    
    # 运动动作
    "boxing": {"sleep_time": 5, "action": ["boxing"], "name": "boxing", "type": "action"},
    "boxing2": {"sleep_time": 5, "action": ["boxing2"], "name": "boxing2", "type": "action"},
    "push_ups": {"sleep_time": 8, "action": ["push-up"], "name": "push_ups", "type": "action"},
    "push_up": {"sleep_time": 8, "action": ["push-up"], "name": "push_up", "type": "action"},
    "press_up": {"sleep_time": 8, "action": ["press-up"], "name": "press_up", "type": "action"},
    "moonwalk": {"sleep_time": 6, "action": ["moonwalk"], "name": "moonwalk", "type": "action"},
    "spacewalk": {"sleep_time": 6, "action": ["spacewalk"], "name": "spacewalk", "type": "action"},
    "jump": {"sleep_time": 3, "action": ["jump"], "name": "jump", "type": "action"},
    "stretch": {"sleep_time": 5, "action": ["stretch"], "name": "stretch", "type": "action"},
    "pee": {"sleep_time": 4, "action": ["pee"], "name": "pee", "type": "action"},
    "demo": {"sleep_time": 10, "action": ["demo"], "name": "demo", "type": "action"},
    
    # 特殊动作
    "up_stairs_3_5cm": {"sleep_time": 5, "action": ["up_stairs_3.5cm"], "name": "up_stairs_3_5cm", "type": "action"},
    "kick_ball_left": {"sleep_time": 3, "action": ["kick_ball_left"], "name": "kick_ball_left", "type": "action"},
    "kick_ball_right": {"sleep_time": 3, "action": ["kick_ball_right"], "name": "kick_ball_right", "type": "action"},
    "Clamping": {"sleep_time": 3, "action": ["Clamping"], "name": "Clamping", "type": "action"},
}

idle_action: Dict[str, Any] = {"name": None, "sleep_time": 0}

class ActionExecutor:
    def __init__(self) -> None:
        self.logger = logging.getLogger(__name__)
        self.action_queue: queue.Queue = queue.Queue()
        self.current_action: Dict[str, Any] = idle_action.copy()
        self.is_running: bool = False
        self._immediate_stop_event = threading.Event()
        self.queue_lock = threading.Lock()
        self._stop_event = threading.Event()
        
        # 初始化ROS2
        rclpy.init()
        self.node = Node('puppy_action_executor')
        
        # 创建ROS2发布者
        self.pose_pub = self.node.create_publisher(Pose, '/puppy_control/pose', 10)
        self.velocity_pub = self.node.create_publisher(Velocity, '/puppy_control/velocity', 10)
        
        # 创建动作服务客户端
        self.run_action_client = self.node.create_client(SetRunActionName, '/puppy_control/runActionGroup')
        while not self.run_action_client.wait_for_service(timeout_sec=1.0):
            self.logger.info('Service /puppy_control/runActionGroup not available, waiting...')
        
        self.consumer_thread = threading.Thread(target=self._consumer, daemon=True)
        self.consumer_thread.start()
        
        # ROS2 spin线程
        self.ros_thread = threading.Thread(target=self._ros_spin, daemon=True)
        self.ros_thread.start()

    def _ros_spin(self):
        while not self._stop_event.is_set():
            try:
                rclpy.spin_once(self.node, timeout_sec=0.1)
            except Exception as e:
                self.logger.error(f"ROS spin error: {e}")
                break
    
    def _execute_ros_action(self, action_name: str, action_type: str):
        if action_type == "velocity":
            self._execute_velocity_action(action_name)
        elif action_type == "action":
            self._execute_predefined_action(action_name)
        else:
            self._publish_velocity(0.0, 0.0, 0.0)
    
    def _execute_velocity_action(self, action_name: str):
        if action_name == "go_forward":
            self._publish_velocity(5.0, 0.0, 0.0)
        elif action_name == "back_fast":
            self._publish_velocity(-5.0, 0.0, 0.0)
        elif action_name == "left_move_fast":
            self._publish_velocity(0.0, 5.0, 0.0)
        elif action_name == "right_move_fast":
            self._publish_velocity(0.0, -5.0, 0.0)
        elif action_name == "turn_left":
            self._publish_velocity(0.0, 0.0, 1.0)
        elif action_name == "turn_right":
            self._publish_velocity(0.0, 0.0, -1.0)
        elif action_name == "stop":
            self._publish_velocity(0.0, 0.0, 0.0)
    
    def _execute_predefined_action(self, action_name: str):
        request = SetRunActionName.Request()
        # 处理特殊文件名
        if action_name == "Clamping":
            request.name = "Clamping.d6a"
        elif action_name == "look_down":
            request.name = "look_down.d6a"
        else:
            request.name = f'{action_name}.d6ac'
        
        request.wait = True
        future = self.run_action_client.call_async(request)
        
        # 等待服务调用完成
        rclpy.spin_until_future_complete(self.node, future, timeout_sec=10.0)
        
        if future.result() is not None:
            self.logger.info(f'Successfully executed predefined action: {action_name}')
        else:
            self.logger.error(f'Failed to execute predefined action: {action_name}')
            # 如果服务调用失败，尝试使用pose作为备用
            if action_name == "stand":
                self._publish_pose()
    
    def _publish_velocity(self, x: float, y: float, yaw_rate: float):
        msg = Velocity()
        msg.x = x
        msg.y = y
        msg.yaw_rate = yaw_rate
        self.velocity_pub.publish(msg)
    
    def _publish_pose(self):
        msg = Pose()
        msg.stance_x = 0.0
        msg.stance_y = 0.0
        msg.x_shift = -0.6
        msg.height = -10.0
        msg.roll = 0.0
        msg.pitch = 0.0
        msg.yaw = 0.0
        msg.run_time = 500
        self.pose_pub.publish(msg)

    def _run_action(self, action_name: str, action_type: str) -> Optional[Dict[str, Any]]:
        try:
            self._execute_ros_action(action_name, action_type)
            return {"result": "success"}
        except Exception as e:
            self.logger.error(f"Error running action: {e}")
            return None

    def _run_stop_action(self) -> Optional[Dict[str, Any]]:
        try:
            self._publish_velocity(0.0, 0.0, 0.0)
            return {"result": "success"}
        except Exception as e:
            self.logger.error(f"Error stopping action: {e}")
            return None

    def _execute_action(self, action_item: Dict[str, Any]) -> None:
        action_name = action_item["name"]
        action = actions[action_name]
        self.current_action = {
            "name": action["name"],
            "sleep_time": action["sleep_time"],
        }
        try:
            self._run_action(action_name, action.get("type", "velocity"))
            elapsed = 0.0
            while elapsed < action["sleep_time"]:
                if self._immediate_stop_event.is_set():
                    self.logger.info("Stopping action execution for %s", action_name)
                    self._immediate_stop_event.clear()
                    self._run_stop_action()
                    break
                time.sleep(0.1)
                elapsed += 0.1
        except Exception as e:
            self.logger.error("Error executing action %s: %s", action_name, e)
        finally:
            self._remove_action_by_id(action_item["id"])
            self.current_action = idle_action.copy()

    def _remove_action_by_id(self, action_id: str) -> None:
        with self.queue_lock:
            temp_list = list(self.action_queue.queue)
            filtered = [item for item in temp_list if item["id"] != action_id]
            self._replace_queue(filtered)

    def _replace_queue(self, items: list) -> None:
        self.action_queue.queue.clear()
        for item in items:
            self.action_queue.put(item)

    def _consumer(self) -> None:
        time.sleep(5 - time.time() % 5)
        while not self._stop_event.is_set():
            try:
                if self._immediate_stop_event.is_set():
                    self.logger.info("Immediate stop triggered, clearing queue and setting to idle.")
                    self.clear_action_queue()
                    self.current_action = idle_action.copy()
                    self.is_running = False
                    self._immediate_stop_event.clear()
                    time.sleep(0.5)
                    continue
                time.sleep(1 - time.time() % 1)
                action_item = self.action_queue.get(timeout=1)
                self.is_running = True
                self._execute_action(action_item)
                time.sleep(0.5)
            except queue.Empty:
                self.is_running = False
                time.sleep(0.5)

    def add_action_to_queue(self, action_name: str) -> None:
        action_id = str(uuid4())

        if action_name == "stop":
            self.stop()
            return

        if action_name not in actions:
            self.logger.error("Action '%s' not found in actions dictionary.", action_name)
            return

        with self.queue_lock:
            self.action_queue.put({"id": action_id, "name": action_name})

    def clear_action_queue(self) -> None:
        with self.queue_lock:
            self.action_queue.queue.clear()

    def stop(self) -> None:
        self.logger.info("Immediate stop requested: clearing queue and interrupting current action.")
        self._immediate_stop_event.set()
        self.clear_action_queue()
        with self.queue_lock:
            stand_id = str(uuid4())
            self.action_queue.put({"id": stand_id, "name": "stand"})

    def shutdown(self) -> None:
        self._stop_event.set()
        self.consumer_thread.join()