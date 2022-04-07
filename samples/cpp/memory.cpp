#include<iostream>

int main() {
   float *test = NULL;
   test = new float;
   *test = 42;
   std::cout << "Hello World " << *test << std::endl;
   delete test;
}