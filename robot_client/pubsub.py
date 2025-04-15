# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0.

from awsiot import mqtt5_client_builder
from awscrt import mqtt5, http
import threading
from concurrent.futures import Future
import time
import json

TIMEOUT = 100


received_count = 0
received_all_event = threading.Event()
future_stopped = Future()
future_connection_success = Future()


# Callback when any publish is received
def on_publish_received(publish_packet_data):
    publish_packet = publish_packet_data.publish_packet
    assert isinstance(publish_packet, mqtt5.PublishPacket)
    print("Received message from topic'{}':{}".format(publish_packet.topic, publish_packet.payload))
    global received_count
    received_count += 1
    if received_count == input_count:
        received_all_event.set()


# Callback for the lifecycle event Stopped
def on_lifecycle_stopped(lifecycle_stopped_data: mqtt5.LifecycleStoppedData):
    print("Lifecycle Stopped")
    global future_stopped
    future_stopped.set_result(lifecycle_stopped_data)


# Callback for the lifecycle event Connection Success
def on_lifecycle_connection_success(lifecycle_connect_success_data: mqtt5.LifecycleConnectSuccessData):
    print("Lifecycle Connection Success")
    global future_connection_success
    future_connection_success.set_result(lifecycle_connect_success_data)


# Callback for the lifecycle event Connection Failure
def on_lifecycle_connection_failure(lifecycle_connection_failure: mqtt5.LifecycleConnectFailureData):
    print("Lifecycle Connection Failure")
    print("Connection failed with exception:{}".format(lifecycle_connection_failure.exception))


if __name__ == '__main__':
 
    # Input parameters
    robot_name = "robot_1"
    input_topic = f"{robot_name}/topic"

    input_cert = f"/workspaces/amazon-nova-robotic/certificates/{robot_name}/{robot_name}.cert.pem"
    input_key = f"/workspaces/amazon-nova-robotic/certificates/{robot_name}/{robot_name}.private.key" 
    input_endpoint = "a1qlex7vqi1791-ats.iot.us-east-1.amazonaws.com"
    input_clientId = f"arn:aws:iot:us-east-1:111964674713:thing/{robot_name}"

    input_message = "Hello World"
    input_count = 0
    input_port = 8883
    input_proxy_host = None
    input_proxy_port = 0
    input_is_ci = False


    print("\nStarting MQTT5 PubSub Sample\n")
    message_count = input_count
    message_topic = input_topic
    message_string = input_message

    # Create the proxy options if the data is present in cmdData
    proxy_options = None
    if input_proxy_host is not None and input_proxy_port != 0:
        proxy_options = http.HttpProxyOptions(
            host_name=input_proxy_host,
            port=input_proxy_port)

    # Create MQTT5 client
    client = mqtt5_client_builder.mtls_from_path(
        endpoint=input_endpoint,
        port=input_port,
        cert_filepath=input_cert,
        pri_key_filepath=input_key,
    
        http_proxy_options=proxy_options,
        on_publish_received=on_publish_received,
        on_lifecycle_stopped=on_lifecycle_stopped,
        on_lifecycle_connection_success=on_lifecycle_connection_success,
        on_lifecycle_connection_failure=on_lifecycle_connection_failure,
        client_id=input_clientId)
    print("MQTT5 Client Created")

    if not input_is_ci:
        print(f"Connecting to {input_endpoint} with client ID '{input_clientId}'...")
    else:
        print("Connecting to endpoint with client ID")

    client.start()
    lifecycle_connect_success_data = future_connection_success.result(TIMEOUT)
    connack_packet = lifecycle_connect_success_data.connack_packet
    negotiated_settings = lifecycle_connect_success_data.negotiated_settings
    if not input_is_ci:
        print(
            f"Connected to endpoint:'{input_endpoint}' with Client ID:'{input_clientId}' with reason_code:{repr(connack_packet.reason_code)}")

    # Subscribe

    print("Subscribing to topic '{}'...".format(message_topic))
    subscribe_future = client.subscribe(subscribe_packet=mqtt5.SubscribePacket(
        subscriptions=[mqtt5.Subscription(
            topic_filter=message_topic,
            qos=mqtt5.QoS.AT_LEAST_ONCE)]
    ))
    suback = subscribe_future.result(TIMEOUT)
    print("Subscribed with {}".format(suback.reason_codes))

    # Publish message to server desired number of times.
    # This step is skipped if message is blank.
    # This step loops forever if count was set to 0.
    if message_string:
        if message_count == 0:
            print("Sending messages until program killed")
        else:
            print("Sending {} message(s)".format(message_count))

        publish_count = 1
        while (publish_count <= message_count) or (message_count == 0):
            # message = "{} [{}]".format(message_string, publish_count)
            # print("Publishing message to topic '{}': {}".format(message_topic, message))
            # publish_future = client.publish(mqtt5.PublishPacket(
            #     topic=message_topic,
            #     payload=json.dumps(message_string),
            #     qos=mqtt5.QoS.AT_LEAST_ONCE
            # ))

            # publish_completion_data = publish_future.result(TIMEOUT)
            # print("PubAck received with {}".format(repr(publish_completion_data.puback.reason_code)))
            time.sleep(1)
            publish_count += 1

    received_all_event.wait(TIMEOUT)
    print("{} message(s) received.".format(received_count))

    # Unsubscribe

    print("Unsubscribing from topic '{}'".format(message_topic))
    unsubscribe_future = client.unsubscribe(unsubscribe_packet=mqtt5.UnsubscribePacket(
        topic_filters=[message_topic]))
    unsuback = unsubscribe_future.result(TIMEOUT)
    print("Unsubscribed with {}".format(unsuback.reason_codes))

    print("Stopping Client")
    client.stop()

    future_stopped.result(TIMEOUT)
    print("Client Stopped!")