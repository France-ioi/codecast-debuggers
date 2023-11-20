#!/bin/bash
g++ -g /usr/project/vscode-lldb/code_hooks/initialization.cpp "$1".cpp -o "$1" -ldl
shift
socat tcp-listen:4000,reuseaddr,fork tcp:localhost:4001 &
$@