import os

import boto3

ROBOT_TABLE = os.getenv("RobotTable", "")
dynamodb = boto3.resource("dynamodb")
robot_table = dynamodb.Table(ROBOT_TABLE)


def create_robot(robot_id, data):
    item = {"id": robot_id, **data}
    robot_table.put_item(Item=item)
    return item


def get_robot(robot_id):
    resp = robot_table.get_item(Key={"id": robot_id})
    return resp["Item"] if "Item" in resp else None


def upsert_robot(robot_id, data):
    """
    Create or update a robot with the given ID and data.
    Uses put_item which will automatically overwrite an existing item with the same key.
    """
    item = {"id": robot_id, **data}
    robot_table.put_item(Item=item)
    return item


def update_robot(robot_id, data):
    update_expr = "SET " + ", ".join(f"{k}=:{k}" for k in data)
    expr_attr_vals = {f":{k}": v for k, v in data.items()}
    robot_table.update_item(
        Key={"id": robot_id},
        UpdateExpression=update_expr,
        ExpressionAttributeValues=expr_attr_vals,
    )
    return get_robot(robot_id)


def delete_robot(robot_id):
    robot_table.delete_item(Key={"id": robot_id})
    return True


def list_robots():
    resp = robot_table.scan()
    items = resp.get("Items", [])
    return sorted(items, key=lambda x: x.get("id", ""))
