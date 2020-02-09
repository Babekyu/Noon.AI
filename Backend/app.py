import certifi
import paho.mqtt.client as mqtt
from logic import operations


# Callback on connection
def on_connect(client, userdata, flags, rc):
    print(f'Connected (Result: {rc})')

    # See: https://docs.solace.com/Open-APIs-Protocols/MQTT/MQTT-Topics.htm
    client.subscribe('getFuture')
    client.subscribe('getHistory')

    # Examples of publishing messages to different types of subscriptions
    client.publish('foo', payload='noob')
    client.publish('foo/foo', payload='will not be seen, no one is subscribed to this topic')

    client.publish('hello/world/canada/ottawa', payload='# matches any level')

    client.publish('languages/python2', payload='eol')
    client.publish('languages/python3', payload='valid')
    client.publish('languages/other/level', payload='will not be seen, + only matches one level')

    client.publish('game/player1/move', payload='Moving to (1, 2)')
    client.publish('game/player2/move', payload='Moving to (3, 4)')


# Callback when message is received
def on_message(client, userdata, msg):
    # print(f'Message received on topic: {msg.topic}. Message: {msg.payload}')
    #accepts string ticker
    if (msg.topic == 'getFuture'):
        resp = operations.getFuture(msg.payload)
        client.publish('sendFuture', payload=str(resp))
    # accepts string ticker
    if (msg.topic == 'getHistory'):
        resp = operations.getHistorical(msg.payload)
        client.publish('sendHistory', payload=str(resp))


# If using websockets (protocol is ws or wss), must set the transport for the client as below
# client = mqtt.Client(transport='websockets')
client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

# Required if using TLS endpoint (mqtts, wss, ssl), remove if using plaintext
# Use Mozilla's CA bundle
# client.tls_set(ca_certs=certifi.where())

# Enter your password here
client.username_pw_set('solace-cloud-client', 'rsaa3mlue999lnniss2s17ujnu')

# Use the host and port from Solace Cloud without the protocol
# ex. "ssl://yoururl.messaging.solace.cloud:8883" becomes "yoururl.messaging.solace.cloud"
client.connect('mr2hd0llj3vyaz.messaging.solace.cloud', port=1883)

client.loop_forever()
