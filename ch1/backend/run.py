import os
import logging
from src import create_app

app = create_app()

if __name__ == "__main__":
    if os.environ.get("MORI_QUIET") == "1":
        logging.getLogger('werkzeug').setLevel(logging.ERROR)
    app.run(host="127.0.0.1", port=int(os.environ.get("BACKEND_PORT", "5000")), debug=False)
