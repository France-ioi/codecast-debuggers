tab = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
test = "Test string"

for i in range(0, 10):
    for j in range(0, 10):
        tab[i] = tab[i] + tab[j]

for i in range(0, 10):
    print(str(tab[i]) + ' ')

print("\n")
