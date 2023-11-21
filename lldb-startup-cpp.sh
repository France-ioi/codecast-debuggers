#!/bin/bash
g++ -g /usr/project/vscode-lldb/code_hooks/initialization.cpp "$1" -o "$2" -ldl
shift
shift
socat tcp-listen:4000,reuseaddr,fork tcp:localhost:4001 &
$@