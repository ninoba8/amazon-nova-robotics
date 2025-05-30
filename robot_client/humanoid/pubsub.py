# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0.

import json
import logging
import threading
from concurrent.futures import Future

import yaml
from action_executor import ActionExecutor
from awscrt import http, mqtt5, io, auth
from awsiot import mqtt5_client_builder
import os

TIMEOUT = 10

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)

received_all_event = threading.Event()
future_stopped = Future()
future_connection_success = Future()

executor = ActionExecutor()


def on_publish_received(publish_packet_data):
    try:
        publish_packet = publish_packet_data.publish_packet
        assert isinstance(publish_packet, mqtt5.PublishPacket)
        logging.info(
            "Received message from topic '%s': %s",
            publish_packet.topic,
            publish_packet.payload,
        )
        try:
            payload = json.loads(publish_packet.payload)
            action_name = payload.get("toolName")
            if action_name:
                executor.add_action_to_queue(action_name)
            else:
                logging.warning("No action specified in the payload")
        except json.JSONDecodeError:
            logging.error("Invalid JSON payload received")
    except Exception as e:
        logging.error("Exception in on_publish_received: %s", e)


def on_lifecycle_stopped(lifecycle_stopped_data: mqtt5.LifecycleStoppedData):
    logging.info("Lifecycle Stopped")
    if not future_stopped.done():
        future_stopped.set_result(lifecycle_stopped_data)


def on_lifecycle_connection_success(
    lifecycle_connect_success_data: mqtt5.LifecycleConnectSuccessData,
):
    logging.info("Lifecycle Connection Success")
    if not future_connection_success.done():
        future_connection_success.set_result(lifecycle_connect_success_data)


def on_lifecycle_connection_failure(
    lifecycle_connection_failure: mqtt5.LifecycleConnectFailureData,
):
    logging.error(
        "Lifecycle Connection Failure: %s", lifecycle_connection_failure.exception
    )

def load_settings(settings_path: str) -> dict:
    try:
        with open(settings_path, "r", encoding="utf-8") as file:
            return yaml.safe_load(file)
    except Exception as e:
        logging.error("Failed to load settings: %s", e)
        raise

def build_mqtt_client(settings, use_websocket=False):
    # Common client args
    client_args = dict(
        endpoint=settings["input_endpoint"],
        client_id=settings["input_clientId"],
        keep_alive_interval_sec=5,
        on_publish_received=on_publish_received,
        on_lifecycle_stopped=on_lifecycle_stopped,
        on_lifecycle_connection_success=on_lifecycle_connection_success,
        on_lifecycle_connection_failure=on_lifecycle_connection_failure,
    )
    if not use_websocket:
        # mTLS connection
        return mqtt5_client_builder.mtls_from_path(
            port=8883,
            cert_filepath=settings["input_cert"],
            pri_key_filepath=settings["input_key"],
            ca_filepath=settings["input_ca"],
            **client_args
        )
    else:
        # WebSocket connection (SigV4 auth)
        # You may need to adjust region and credentials provider as needed
        region = settings.get("region", "us-east-1")
        credentials_provider = auth.AwsCredentialsProvider.new_static(
            access_key_id=settings["aws_access_key_id"],
            secret_access_key=settings["aws_secret_access_key"],            
        )
        return mqtt5_client_builder.websockets_with_default_aws_signing(
            region=region,
            credentials_provider=credentials_provider,
            ca_filepath=settings["input_ca"],
            port=443,
            **client_args
        )

def main():
    global future_connection_success
    try:
        settings = load_settings("settings.yaml")
        robot_name = settings["robot_name"]
        base_path = settings["base_path"]
        input_topic = settings["input_topic"].format(
            robot_name=robot_name, base_path=base_path
        )
        settings["input_cert"] = settings["input_cert"].format(
            robot_name=robot_name, base_path=base_path
        )
        settings["input_key"] = settings["input_key"].format(
            robot_name=robot_name, base_path=base_path
        )
        settings["input_ca"] = settings["input_ca"].format(
            robot_name=robot_name, base_path=base_path
        )
        settings["input_clientId"] = settings["input_clientId"].format(
            robot_name=robot_name, base_path=base_path
        )
        if not settings.get("aws_access_key_id"):
            settings["aws_access_key_id"] = os.environ.get("IoTRobotAccessKeyId", "")
        if not settings.get("aws_secret_access_key"):
            settings["aws_secret_access_key"] = os.environ.get(
                "IoTRobotSecretAccessKey", ""
            )
        print("Settings loaded successfully:", json.dumps(settings, indent=2))
    
        message_topic = input_topic

        client = None
        try:
            logging.info("Trying MQTT mTLS connection...")
            client = build_mqtt_client(settings, use_websocket=False)
            client.start()
            lifecycle_connect_success_data = future_connection_success.result(TIMEOUT)
            connack_packet = lifecycle_connect_success_data.connack_packet
            logging.info(
                "Connected to endpoint: '%s' with Client ID: '%s' reason_code: %s",
                settings["input_endpoint"],
                settings["input_clientId"],
                repr(connack_packet.reason_code),
            )
        except Exception as e:
            logging.warning("MQTT mTLS failed: %s. Trying WebSocket...", e)
            # Reset the future for websocket attempt
            future_connection_success = Future()
            client = build_mqtt_client(settings, use_websocket=True)
            client.start()
            lifecycle_connect_success_data = future_connection_success.result(TIMEOUT)
            connack_packet = lifecycle_connect_success_data.connack_packet
            logging.info(
                "Connected to endpoint: '%s' with Client ID: '%s' (WebSocket) reason_code: %s",
                settings["input_endpoint"],
                settings["input_clientId"],
                repr(connack_packet.reason_code),
            )

        logging.info("Subscribing to topic '%s'...", message_topic)
        subscribe_future = client.subscribe(
            subscribe_packet=mqtt5.SubscribePacket(
                subscriptions=[
                    mqtt5.Subscription(
                        topic_filter=message_topic, qos=mqtt5.QoS.AT_LEAST_ONCE
                    )
                ]
            )
        )
        suback = subscribe_future.result(TIMEOUT)
        logging.info("Subscribed with %s", suback.reason_codes)

        logging.info("Sending messages until user inputs 's' to stop")
        while True:
            user_input = input("Type 's' and press Enter to stop the program: ")
            if user_input.strip().lower() == "s":
                logging.info("'s' received, shutting down gracefully...")
                received_all_event.set()
                break
    except Exception as e:
        logging.error("Exception occurred in main loop: %s", e)
    finally:
        try:
            logging.info("Unsubscribing from topic '%s'", message_topic)
            unsubscribe_future = client.unsubscribe(
                unsubscribe_packet=mqtt5.UnsubscribePacket(
                    topic_filters=[message_topic]
                )
            )
            unsuback = unsubscribe_future.result(TIMEOUT)
            logging.info("Unsubscribed with %s", unsuback.reason_codes)
        except Exception as e:
            logging.warning("Exception during unsubscribe: %s", e)
        logging.info("Stopping Client")
        client.stop()
        executor.stop()
        try:
            future_stopped.result(TIMEOUT)
        except Exception as e:
            logging.warning("Exception waiting for client stop: %s", e)
        logging.info("Client Stopped!")

if __name__ == "__main__":
    main()
