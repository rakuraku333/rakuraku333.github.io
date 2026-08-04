public class Hola {
    public static void main(String[] args) {
        int[] nums = { 3, 1, 4, 1, 5 };
        int suma = 0;
        for (int n : nums) {
            suma += n;
        }
        System.out.println("Suma: " + suma);
    }
}
