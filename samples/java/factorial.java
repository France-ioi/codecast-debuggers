class Factorial {
    public static void main(String[] args) {
        Integer x = 1;
        for (int i = 2; i < 100; i++) {
            x = x * i;
        }
        System.out.println("x = " + x);
    }
}