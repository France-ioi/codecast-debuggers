class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    def getAge(self):
        return self.age
p1 = Person("John", 36)
print(p1.name)
print(p1.getAge())

# Objects
class Test:
    def __init__(selfref, a, b, m):
        selfref.a = a
        selfref.b = b
        selfref.m = m

    def sum(self):
        self.m = "newmessage"
        return self.a + self.b

    def sum2(objSelf):
        objSelf.m = "newmessage obj"
        return objSelf.a + objSelf.b

    def getM(self):
        return self.m

class Test2:
    def __init__(selfref):
        selfref.a = 41

test = Test(41, 1, "Bonjour")
test.b = 10
test2 = Test2()
test2.a = 42
test2.b = "plop"
print(test.sum())
test.sum2()
print(test.getM())
