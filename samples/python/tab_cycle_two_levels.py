a0 = [0, 1]
b0 = [a0, 3]
c0 = [b0, 4]
a0[1] = c0

a0[0] = 42
# 42
print(a0[0])
# 42
print(a0[1][0][0][0])
