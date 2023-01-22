const ws = require("ws");
const fs = require("fs");
const http = require("http");

const HOST = "127.0.0.1";
const PORT = 8000;

const index = fs.readFileSync("./index.html", "utf8");

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end(index);
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
});

const wss = new ws.WebSocketServer({ server });

wss.on("connection", (currConn, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`Connected ${ip}`);

    currConn.on("message", (message) => {
        console.log("Received: " + message);

        broadcastMessage(message, currConn);
    });

    currConn.on("close", () => {
        console.log(`Disconnected ${ip}`);
    });
});

function broadcastMessage(message, currWs) {
    wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN && client !== currWs) {
            client.send(message, { binary: false });
        }
    });
}
