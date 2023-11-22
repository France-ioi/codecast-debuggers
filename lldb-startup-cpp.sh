#!/bin/bash
if ! g++ -g /usr/project/vscode-lldb/code_hooks/initialization.cpp "$1" -o "$2" -ldl
then
    echo "___COMPILATION_ERROR___" >&2
    exit 1
fi
shift
shift
socat tcp-listen:4000,reuseaddr,fork tcp:localhost:4001 &
$@