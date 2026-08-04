import java.util.Scanner;

public class leerTresNumeros {

  public static void main(String[] args) {

    Scanner teclado = new Scanner(System.in);

    System.out.print("Ingrese primer numero: ");
    int n1 = teclado.nextInt();

    System.out.print("Ingrese segundo numero: ");
    int n2 = teclado.nextInt();

    System.out.print("Ingrese tercer numero: ");
    int n3 = teclado.nextInt();

    if (n1 > n2 && n1 > n3) {
      System.out.println(n1 + " es mayor");
    } else if (n2 > n3) {
      System.out.println(n2 + " es mayor");
    } else {
      System.out.println(n3 + " es mayor");

    }

    teclado.close();
  }
}
