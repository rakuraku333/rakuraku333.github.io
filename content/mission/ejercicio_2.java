
// Leer un número entero que representa segundos totales y mostrar cuántos minutos y segundos son (pensar qué operador te da el "cociente" y cuál el "resto").
import java.util.Scanner;

public class ejercicio_2 {
  public static void main(String[] args) {
    Scanner teclado = new Scanner(System.in);
    System.out.println("Ingrese la cantidad de segundos: ");
    int numero = teclado.nextInt();
    int resultadoMinutos = numero / 60;
    int resultadoSegundos = numero % 60;

    System.out.println("Esa cantidad de segundos equivale a: "
        + resultadoMinutos + "minutos y "
        + resultadoSegundos + " segundos.");
    teclado.close();
  }
}

// 1 minuto = 60 segundos y 60 segundos = 1 minuto por ende: 1 segundo
