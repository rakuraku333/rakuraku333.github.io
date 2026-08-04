public class ejercicio_control1 {

  private static String clasificarNota(int nota) {
    String resultado;

    if (nota < 4) {
      resultado = "Desaprobado";
    } else if (nota <= 6) {
      resultado = "Regular";
    } else {
      resultado = "Aprobado";
    }

    return resultado;
  }

  private static boolean esRangoValido(int valor, int min, int max) {
    return valor >= min && valor <= max;
  }

  private static boolean esDivisiblePor2o3(int n) {
    return (n % 2 == 0) || (n % 3 == 0);
  }

  public static void main(String[] args) {

    System.out.println(clasificarNota(5));
    System.out.println(esRangoValido(15, 10, 20));
    System.out.println(esDivisiblePor2o3(7));

    int dia = 3;

    switch (dia) {
      case 6:
      case 7:
        System.out.println("Fin de semana");
        break;

      default:
        System.out.println("Dia habil");
    }
  }
}
