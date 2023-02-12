const ws = require("ws");
const fs = require("fs");
const http = require("http");

const index = fs.readFileSync("public/index.html", "utf8");


const HOST = "127.0.0.1";
const PORT = 8000;

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end(index);
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
});

const wss = new ws.WebSocketServer({ server });

const messages = [];

wss.on("connection", (websocketConnection, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[open] Connected ${ip}`);

    broadcastMessages(messages, websocketConnection);

    websocketConnection.on("message", (message) => {
        console.log("[message] Received: " + message);

        messages.push(message);

        broadcastMessage(message, websocketConnection);
    });

    websocketConnection.on("close", () => {
        console.log(`[close] Disconnected ${ip}`);
    });
});

function broadcastMessages(messages, client) {
    messages.forEach((message) =>
        client.send(message, { binary: false })
    );
}

function broadcastMessage(message, websocketConnection) {
    wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN && client !== websocketConnection) {
            client.send(message, { binary: false });
        }
    });
}
