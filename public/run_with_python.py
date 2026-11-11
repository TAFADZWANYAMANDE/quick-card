import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

print("=" * 60)
print("  QUICKCARD OFFLINE LOCAL SERVER")
print("=" * 60)
print(f"Serving folder: {DIRECTORY}")
print(f"Address: http://localhost:{PORT}")
print("Opening your browser automatically...")
print("Press Ctrl+C anytime to stop.")
print("=" * 60)

# Open browser automatically
webbrowser.open(f"http://localhost:{PORT}")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
    sys.exit(0)
except Exception as e:
    print(f"Error starting on port {PORT}: {e}")
    # Try port 8080 if 8000 is busy
    try:
        with socketserver.TCPServer(("", 8080), Handler) as httpd:
            webbrowser.open("http://localhost:8080")
            httpd.serve_forever()
    except Exception:
        pass
