text1 = "xxxxxxxxxx"
text2 = "oxooxooxxo"

maxLength = 0
bestStart = 0
for debut in range(len(text1)):
    for length in range(len(text1) - debut + 1):
        nbDiffs = 0
        for pos in range(length):
            if text1[debut + pos] != text2[debut + pos]:
                nbDiffs += 1
        if nbDiffs < 3 and length > maxLength:
            bestStart = debut
            maxLength = length
output = ""
for pos in range(maxLength):
    t1 = text1[bestStart + pos]
    t2 = text2[bestStart + pos]
    if  t1 != t2:
        output += "?"
    else:
        output += t1
print(output)
