import java.util.Scanner;

public class ejercicio_4 {
  public static void main(String[] args) {
    Scanner teclado = new Scanner(System.in);
    System.out.print("Ingresar el numero a chequear si es par o inpar: ");
    int numero = teclado.nextInt();
    int comprobante = numero % 2;
    boolean par = comprobante == 0;

    System.out.println(par);
    teclado.close();
  }
}
