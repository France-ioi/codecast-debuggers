import sys

x = 3
y = 0
for i in range(x):
    y = i * 2
    print("Number: {}".format(y))
if y < 6:
    # indented four spaces
    print("Goodbye world", file=sys.stderr)
