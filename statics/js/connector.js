class Connector {
	onOpen;
	onClose;
	onError;
	onMessage;
	
	/**
	 * @param {function} onOpen 
	 * @param {function} onClose 
	 * @param {function} onError 
	 * @param {function} onMessage 
	 */
	init(onOpen, onClose, onError, onMessage) {
		this.onOpen = onOpen;
		this.onClose = onClose;
		this.onError = onError;
		this.onMessage = onMessage;
	}

	/**
	 * @returns {boolean}
	 */
	connected() {};
	connect() {};
	send() {};
	close() {};
}

class WebSocketConnector extends Connector {
	webSocket;

	connected() {
		return this.webSocket && this.webSocket.readyState === this.webSocket.OPEN;
	}

	connect() {
		if(this.connected())
			return;

		this.webSocket = new WebSocket((window.location.protocol == 'https:' ? 'wss' : 'ws') + '://' + window.location.host + window.location.pathname + '/ws');

		this.webSocket.onerror = this.onError;
		this.webSocket.onopen = this.onOpen;
		this.webSocket.onclose = this.onClose;
		this.webSocket.onmessage = this.onMessage;
	};

	send(was) {
		was = JSON.stringify(was);
		this.webSocket.send(was);
	}

	close() {
		this.webSocket.close();
	}
}