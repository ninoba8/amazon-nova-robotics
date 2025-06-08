"""
Database service layer - Provides higher-level database operations
"""

from typing import Any, Dict, List, Optional

from database import delete_robot as db_delete_robot
from database import get_robot as db_get_robot
from database import list_robots as db_list_robots
from database import upsert_robot as db_upsert_robot


def get_robot(robot_id: str) -> Optional[Dict[str, Any]]:
    """Get a robot by ID with enhanced error handling"""
    try:
        return db_get_robot(robot_id)
    except Exception as e:
        print(f"Error getting robot {robot_id}: {str(e)}")
        return None


def upsert_robot(robot_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create or update a robot with validation"""
    required_fields = ["robot_name"]

    # Ensure required fields are present
    for field in required_fields:
        if field not in data:
            data[field] = "Unknown"  # Set default value

    return db_upsert_robot(robot_id, data)


def delete_robot(robot_id: str) -> bool:
    """Delete a robot by ID with confirmation"""
    try:
        db_delete_robot(robot_id)
        return True
    except Exception as e:
        print(f"Error deleting robot {robot_id}: {str(e)}")
        return False


def list_robots() -> List[Dict[str, Any]]:
    """List all robots with enhanced error handling"""
    try:
        return db_list_robots()
    except Exception as e:
        print(f"Error listing robots: {str(e)}")
        return []
