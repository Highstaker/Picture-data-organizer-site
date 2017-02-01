#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo $SCRIPT_DIR
cd $SCRIPT_DIR

PYTHON_INTERPRETER_LINK_NAME="python_NFC_fursuiters_organizer"
# create link
ln -s env/bin/python3 $SCRIPT_DIR/$PYTHON_INTERPRETER_LINK_NAME

# run the server
$SCRIPT_DIR/$PYTHON_INTERPRETER_LINK_NAME photodata_organizer.py

exit 0;
