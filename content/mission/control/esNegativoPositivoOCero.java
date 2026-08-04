import java.util.Scanner;

public class esNegativoPositivoOCero {
  private static String clasificarNum(int num) {
    String resultado;
    if (num < 0) {
      resultado = "es Negativo.";
    } else if (num == 0) {
      resultado = "es Cero.";
    } else {
      resultado = "es Positivo.";
    }
    return resultado;
  }

  public static void main(String[] args) {

    Scanner teclado = new Scanner(System.in);

    System.out.print("Ingresa el numero a analizar: ");
    int num = teclado.nextInt();

    System.out.println(clasificarNum(num));
    teclado.close();
  }
}
