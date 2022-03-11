#include <stdio.h>

int main()
{
    int tab[] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };
    char test[] = "Test string";

    for (int count = 0; count < 100; count++) {
        for (int i = 0; i < 16; i++) {
            for (int j = 0; j < 16; j++) {
                tab[i] += tab[j];
            }
        }
    }

    for (int i = 0; i < 16; i++) {
        printf("%d ", tab[i]);
    }

    printf("\n");

    return 0;
}
