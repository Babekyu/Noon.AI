import certifi
import json
import paho.mqtt.client as mqtt
from logic import operations, SentimentAnalysis
import multiprocessing as mp
from functools import partial
class application:
    # Callback on connection
    def on_connect(self,client, userdata, flags, rc):
        print(f'Connected (Result: {rc})')

        # See: https://docs.solace.com/Open-APIs-Protocols/MQTT/MQTT-Topics.htm
        client.subscribe('getFuture')
        client.subscribe('getHistory')
        client.subscribe('getSentiment')


        # Examples of publishing messages to different types of subscriptions
        # client.publish('foo', payload='noob')
        # client.publish('foo/foo', payload='will not be seen, no one is subscribed to this topic')
        #
        # client.publish('hello/world/canada/ottawa', payload='# matches any level')
        #
        # client.publish('languages/python2', payload='eol')
        # client.publish('languages/python3', payload='valid')
        # client.publish('languages/other/level', payload='will not be seen, + only matches one level')
        #
        # client.publish('game/player1/move', payload='Moving to (1, 2)')
        # client.publish('game/player2/move', payload='Moving to (3, 4)')


    # Callback when message is received
    def on_message(self, client, userdata, msg):
        # print(f'Message received on topic: {msg.topic}. Message: {msg.payload}')
        # accepts string ticker
        print(msg.topic)
        if (msg.topic == 'getFuture'):
            self.pool.apply_async(operations.getFuture,(msg.payload.decode(),),callback=partial(self.publishCallback,'sendFuture'))
        # accepts string ticker
        if (msg.topic == 'getHistory'):
            self.pool.apply_async(operations.getHistorical,(msg.payload.decode(),),callback=partial(self.publishCallback,'sendHistory'))
        # accepts object with 'start', 'end' and 'ticker'
        if (msg.topic == 'getSentiment'):
            params = (json.loads(msg.payload.decode()))
            print(params)
            self.pool.apply_async(SentimentAnalysis.getSentiment,(params['start'], params['end'], params['ticker']), callback=partial(self.publishCallback,'sendSentiment'))

    def publishCallback(self, topic, result):
        client.publish(topic, payload=json.dumps(result))
        print(topic + ' has resolved')

    def __init__(self):
        self.pool = mp.Pool(6,maxtasksperchild=3)

if __name__ == '__main__':
    # If using websockets (protocol is ws or wss), must set the transport for the client as below
    # client = mqtt.Client(transport='websockets')
    client = mqtt.Client()
    app = application()
    client.on_connect = app.on_connect
    client.on_message = app.on_message

    # Required if using TLS endpoint (mqtts, wss, ssl), remove if using plaintext
    # Use Mozilla's CA bundle
    # client.tls_set(ca_certs=certifi.where())

    # Enter your password here
    client.username_pw_set('solace-cloud-client', 'rsaa3mlue999lnniss2s17ujnu')

    # Use the host and port from Solace Cloud without the protocol
    # ex. "ssl://yoururl.messaging.solace.cloud:8883" becomes "yoururl.messaging.solace.cloud"
    client.connect('mr2hd0llj3vyaz.messaging.solace.cloud', port=1883)

    client.loop_forever()
