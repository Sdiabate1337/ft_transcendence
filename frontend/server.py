from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class SPARequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Try to serve the requested file
        file_path = self.translate_path(self.path)
        
        # If the file doesn't exist and it's not a file request (no extension),
        # serve index.html instead
        if not os.path.exists(file_path) and '.' not in os.path.basename(self.path):
            self.path = '/index.html'
        
        return SimpleHTTPRequestHandler.do_GET(self)

    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        SimpleHTTPRequestHandler.end_headers(self)

def run_server():
    port = 8082
    server_address = ('', port)
    
    httpd = HTTPServer(server_address, SPARequestHandler)
    print(f'Starting server on port {port}...')
    print(f'Open http://localhost:{port} in your browser')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down server...')
        httpd.server_close()

if __name__ == '__main__':
    run_server()
