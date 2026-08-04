
import java.util.Scanner;

public class ejercicio_5 {
  public static void main(String[] args) {
    Scanner teclado = new Scanner(System.in);
    System.out.print("Ingrese la cantidad a convertir: ");
    double celsius = teclado.nextDouble();
    double farh = (celsius * 9.0 / 5.0 + 32);
    System.out.println("La conversion da: " + farh + " grados Fahrenheit. ");
    teclado.close();
  }
}
