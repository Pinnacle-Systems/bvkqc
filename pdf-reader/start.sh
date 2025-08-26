#!/bin/bash
cd "$(dirname "$0")"
source myenv/bin/activate
exec gunicorn -b 0.0.0.0:5000 app:app
