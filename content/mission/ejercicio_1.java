import java.util.Scanner;

public class ejercicio_1 {
  public static void main(String[] args) {

    Scanner teclado = new Scanner(System.in);
    System.out.print("Ingrese el primer numero: ");
    int valor1 = teclado.nextInt();
    System.out.print("Ingrese el segundo numero: ");
    int valor2 = teclado.nextInt();
    System.out.println("La suma de los dos es: " + (valor1 + valor2));
    System.out.println("La multiplicacion de los dos es: " + (valor1 * valor2));
    System.out.println("La division de los dos es: " + (valor1 / valor2));
    System.out.println("La resta de los dos es: " + ((double) valor1 - valor2));
    System.out.println("El resto de los dos es: " + (valor1 % valor2));

    teclado.close();

  }

}
