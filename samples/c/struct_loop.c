#include <stdio.h>

struct sListElement {
    int val;
    struct sListElement *next;
};

int main()
{
    struct sListElement element, nextElement;
    element.val = 42;
    element.next = &nextElement;

    nextElement.val = 1;
    nextElement.next = &element;

    printf("Test struct loop\n");

    return 0;
}
