#include <stdio.h>

int main()
{
    int tab[] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    char test[] = "Test string";

    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 10; j++) {
            tab[i] += tab[j];
        }
    }

    for (int i = 0; i < 10; i++) {
        printf("%d ", tab[i]);
    }

    printf("\n");

    return 0;
}
