import java.util.Scanner;

public class edadCategoria {

  private static String clasificarPersona(int edad) {

    String resultado;

    if (edad < 0) {
      resultado = "ingresó una edad invalida.";
    } else if (edad <= 12) {
      resultado = "es Infante.";
    } else if (edad <= 17) {
      resultado = "es Adolescente.";
    } else if (edad <= 64) {
      resultado = "es Adulto.";
    } else {
      resultado = "es Adulto mayor.";
    }
    return resultado;
  }

  public static void main(String[] args) {

    Scanner teclado = new Scanner(System.in);

    System.out.print("¿Que edad tiene?: ");
    int edad = teclado.nextInt();

    String resultado = clasificarPersona(edad);

    System.out.println("LA persona " + resultado);

    teclado.close();
  }
}
