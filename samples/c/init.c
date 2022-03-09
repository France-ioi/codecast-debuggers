// This function should be executed before main()
void __attribute__ ((constructor)) __init__()
{
    int pre = 1;
}

int main()
{
    int a = 42;

    return 0;
}
