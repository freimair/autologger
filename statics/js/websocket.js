class Connection {
	static webSocket;
	onOpen;
	onClose;
	onError;
	onMessage;

	/**
	 * 
	 * @param {function} onOpen 
	 * @param {function} onClose 
	 * @param {function} onError 
	 * @param {function} onMessage 
	 */
	constructor(onOpen, onClose, onError, onMessage) {
		this.onOpen = onOpen;
		this.onClose = onClose;
		this.onError = onError;
		this.onMessage = onMessage;
	}

	static connected() {
		return Connection.webSocket && Connection.webSocket.readyState === Connection.webSocket.OPEN;
	}

	connect() {
		if(Connection.connected())
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