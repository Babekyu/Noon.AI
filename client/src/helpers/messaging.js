import Paho from 'paho-mqtt';
import options from './messaging-config';

class Messaging extends Paho.Client {
  constructor() {
    super(
      options.invocationContext.host,
      Number(options.invocationContext.port),
      options.invocationContext.clientId,
    );
    this.onMessageArrived = this.handleMessage.bind(this);
    this.callbacks = [];
  }

  connectWithPromise() {
    return new Promise((resolve, reject) => {
      options.onSuccess = resolve;
      options.onFailure = reject;
      this.connect(options);
    });
  }

  // called when the client loses its connection
  onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log('Connection lost with Solace Cloud');
    }
    // Add auto connect logic with backoff here if you want to automatically reconnect
  }

  register(callback) {
    this.callbacks.push(callback);
  }

  // called when a message arrives
  handleMessage(message) {
    console.log(message);
    // console.log(message.payloadString);
    // console.log('Received message', message.payloadString);
    this.callbacks.forEach((callback) => callback(message));
  }

  send(message) {
    super.send(message);
  }

  subscribe(topic) {
    super.subscribe(topic);
  }
}

const messaging = new Messaging();
export default messaging;
