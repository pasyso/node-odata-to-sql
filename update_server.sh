#!/bin/bash
cd "$(dirname "$0")"
TARGET_DIR=/opt/jsreport/node_modules/odata-to-sql
rsync -avzP ./lib agave-jsreport:$TARGET_DIR/
