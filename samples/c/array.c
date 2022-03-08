#include <stdio.h>

#define SIZE 6

int main()
{
    int tab[SIZE] = {1, 2, 3, 4, 5, 6};

    for (int i = 0; i < SIZE; i++) {
        tab[i] = tab[i] + 1;
        printf("%d ", tab[i]);
    }

    return 0;
}
