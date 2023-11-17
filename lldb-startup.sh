#!/bin/bash
g++ -g "$1".cpp -o "$1" -ldl
shift
socat tcp-listen:4000,reuseaddr,fork tcp:localhost:4001 &
$@