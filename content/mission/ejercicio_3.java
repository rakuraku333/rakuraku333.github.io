import java.util.Scanner;

public class ejercicio_3 {
  public static void main(String[] args) {
    Scanner teclado = new Scanner(System.in);
    System.out.print("Ingrese el precio del producto: ");
    double valorProducto = teclado.nextDouble();
    System.out.print("Ingrese la cantidad a comprar:");
    int cantidadProducto = teclado.nextInt();
    double totalPagar = valorProducto * cantidadProducto;
    System.out.println("La cantidad total a pagar sera: " + totalPagar);
    teclado.close();
  }
}

// Leer el precio de un producto (`double`) y la cantidad comprada (`int`),
// mostrar el total a pagar.
