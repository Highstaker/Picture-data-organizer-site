#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo $SCRIPT_DIR
cd $SCRIPT_DIR

env/bin/python3 photodata_organizer.py

exit 0;
