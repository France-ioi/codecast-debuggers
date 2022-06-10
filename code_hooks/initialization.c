#include <stdio.h>

/**
 * This function is called before main()
 * See: https://stackoverflow.com/questions/8713470/executing-code-before-main
 */
void __attribute__ ((constructor)) __init__()
{
    /**
     * Disable stdout buffering.
     * See: https://stackoverflow.com/questions/7876660/how-to-turn-off-buffering-of-stdout-in-c
     */
    setvbuf(stdout, NULL, _IONBF, 0);
}
