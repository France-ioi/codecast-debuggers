#include <stdio.h>

int main()
{
    int tab[] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    int tab2[] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    int tab3[] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    int tab4[] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    int tab5[] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    int tab6[] = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    char test[] = "Test string";

    // Note: 200 should work, 500 should take more than 10 seconds. Issue is that we have no output if it takes too long.
    for (int i = 0; i < 500; i++) {
        tab[i%10] += i;
    }

    for (int i = 0; i < 10; i++) {
        printf("%d ", tab[i]);
    }
    printf("\n");

    return 0;
}
