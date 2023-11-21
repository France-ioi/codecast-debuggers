#!/bin/bash
gcc -g "$1" -o "$2" -ldl
shift
shift
socat tcp-listen:4000,reuseaddr,fork tcp:localhost:4001 &
$@