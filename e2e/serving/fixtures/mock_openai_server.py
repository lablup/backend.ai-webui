"""
Lightweight mock OpenAI-compatible server for Backend.AI E2E testing.

Serves two endpoints:
  GET  /v1/models          -> model list
  POST /v1/chat/completions -> SSE streaming chat response

Uses only Python stdlib — no external dependencies required.
The response content includes SERVICE_ID env var for differentiating
between multiple deployed services in sync tests.
"""

import json
import os
import time
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler

SERVICE_ID = os.environ.get("SERVICE_ID", "A")
MODEL_ID = os.environ.get("MODEL_ID", f"mock-model-{SERVICE_ID.lower()}")
PORT = int(os.environ.get("PORT", "8000"))


class MockOpenAIHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/v1/models" or self.path.startswith("/v1/models?"):
            self._serve_models()
        elif self.path == "/health" or self.path == "/":
            self._serve_health()
        else:
            self._not_found()

    def do_POST(self):
        if self.path == "/v1/chat/completions":
            self._serve_chat_completions()
        else:
            self._not_found()

    def _serve_health(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok"}).encode())

    def _serve_models(self):
        body = {
            "object": "list",
            "data": [{"id": MODEL_ID, "object": "model", "owned_by": "mock"}],
        }
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def _serve_chat_completions(self):
        content_length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(content_length) if content_length else b"{}"
        try:
            req = json.loads(raw)
        except json.JSONDecodeError:
            req = {}

        stream = req.get("stream", False)
        user_msg = ""
        for msg in req.get("messages", []):
            if msg.get("role") == "user":
                content = msg.get("content", "")
                if isinstance(content, str):
                    user_msg = content

        reply = f"Response from Service {SERVICE_ID}: echo '{user_msg}'"

        if stream:
            self._stream_response(reply)
        else:
            self._non_stream_response(reply)

    def _non_stream_response(self, content):
        body = {
            "id": f"chatcmpl-{uuid.uuid4().hex[:8]}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": MODEL_ID,
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": content},
                    "finish_reason": "stop",
                }
            ],
            "usage": {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
        }
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def _stream_response(self, content):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self._send_cors_headers()
        self.end_headers()

        chat_id = f"chatcmpl-{uuid.uuid4().hex[:8]}"
        created = int(time.time())

        chunk1 = {
            "id": chat_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": MODEL_ID,
            "choices": [{"index": 0, "delta": {"role": "assistant", "content": ""}, "finish_reason": None}],
        }
        self.wfile.write(f"data: {json.dumps(chunk1)}\n\n".encode())
        self.wfile.flush()

        chunk2 = {
            "id": chat_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": MODEL_ID,
            "choices": [{"index": 0, "delta": {"content": content}, "finish_reason": None}],
        }
        self.wfile.write(f"data: {json.dumps(chunk2)}\n\n".encode())
        self.wfile.flush()

        chunk3 = {
            "id": chat_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": MODEL_ID,
            "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
        }
        self.wfile.write(f"data: {json.dumps(chunk3)}\n\n".encode())
        self.wfile.write(b"data: [DONE]\n\n")
        self.wfile.flush()

    def _not_found(self):
        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"error": "not found"}).encode())

    def log_message(self, format, *args):
        pass


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), MockOpenAIHandler)
    print(f"Mock OpenAI server (Service {SERVICE_ID}) listening on port {PORT}")
    server.serve_forever()
