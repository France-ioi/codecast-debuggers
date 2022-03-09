#include <stdio.h>

int main()
{
    char buffer[16];

    while (fgets(buffer, 16, stdin)) {
        printf("%s", buffer);
    }

    return 0;
}
