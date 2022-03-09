#include <stdio.h>
#include <stdlib.h>

char global[] = "Hello world !";

void test()
{
    return 0;
}

int main()
{
    char local[] = "Hi there !";

    void (*fun_ptr)() = &test;
    printf("fun_ptr : %u\n", fun_ptr);

    char *ptr = (char *)malloc(16);
    printf("ptr 1 : %u\n", ptr);

    char *ptr2 = (char *)malloc(16);
    printf("ptr 2 : %u\n", ptr);

    ptr = (char *)realloc(ptr, 32);
    printf("ptr 1 reallocated : %u\n", ptr);

    free(ptr);

    return 0;
}
