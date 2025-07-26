from pyzmap import APIServer

# Create and start the API server
server = APIServer(host="0.0.0.0", port=8000)

server.run()