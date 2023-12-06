class Add {
    public static int add(int a, int b) {
        int c = a + b;
        return c;
    }
    
    public static void main(String[] args) {
        int x = 5;
        System.out.println("Hello, World!");
        int y = 3;
        int z = add(x, y);
        System.out.println("Hello, World, again!");
        System.out.println(z);
    }
}