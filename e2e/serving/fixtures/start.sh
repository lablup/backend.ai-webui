#!/bin/bash
# Entry point for deployment presets whose startup command is
# `bash /models/start.sh` (a common convention for hand-made "custom"
# runtime presets). Delegates to the same GPU-free mock OpenAI server that
# model-definition.yaml starts, so the provisioned model folder stays
# startable regardless of which compatible preset a run ends up using.
exec python3 /models/mock_openai_server.py
