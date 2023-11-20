#include <stdio.h>

class RemoveOutputBuffering {
    public:
        RemoveOutputBuffering() {
            /**
            * Disable stdout buffering.
            * See: https://stackoverflow.com/questions/7876660/how-to-turn-off-buffering-of-stdout-in-c
            */
            setvbuf(stdout, NULL, _IONBF, 0);
        }
};

RemoveOutputBuffering __remove_output_buffering__;