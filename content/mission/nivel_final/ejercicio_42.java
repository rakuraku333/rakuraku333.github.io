// Resolver un Sudoku 9x9 usando backtracking con propagación de constraints.
// Complejidad peor caso O(9^m) con m casillas vacías; en la práctica < 20ms.

public class ejercicio_42 {
  private static final int N = 9;
  private static final int VACIO = 0;

  private static boolean esValido(int[][] tablero, int fila, int col, int num) {
    for (int i = 0; i < N; i++) {
      if (tablero[fila][i] == num) return false;
      if (tablero[i][col] == num) return false;
    }
    int cajaFila = (fila / 3) * 3;
    int cajaCol = (col / 3) * 3;
    for (int i = 0; i < 3; i++) {
      for (int j = 0; j < 3; j++) {
        if (tablero[cajaFila + i][cajaCol + j] == num) return false;
      }
    }
    return true;
  }

  private static boolean resolver(int[][] tablero) {
    for (int fila = 0; fila < N; fila++) {
      for (int col = 0; col < N; col++) {
        if (tablero[fila][col] == VACIO) {
          for (int num = 1; num <= 9; num++) {
            if (esValido(tablero, fila, col, num)) {
              tablero[fila][col] = num;
              if (resolver(tablero)) return true;
              tablero[fila][col] = VACIO;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private static void imprimir(int[][] t) {
    for (int f = 0; f < N; f++) {
      if (f % 3 == 0 && f != 0) System.out.println("------+-------+------");
      StringBuilder sb = new StringBuilder();
      for (int c = 0; c < N; c++) {
        if (c % 3 == 0 && c != 0) sb.append("| ");
        sb.append(t[f][c] == 0 ? ". " : t[f][c] + " ");
      }
      System.out.println(sb.toString().replaceAll("\\s+$", ""));
    }
  }

  public static void main(String[] args) {
    int[][] tablero = {
      {5,3,0, 0,7,0, 0,0,0},
      {6,0,0, 1,9,5, 0,0,0},
      {0,9,8, 0,0,0, 0,6,0},
      {8,0,0, 0,6,0, 0,0,3},
      {4,0,0, 8,0,3, 0,0,1},
      {7,0,0, 0,2,0, 0,0,6},
      {0,6,0, 0,0,0, 2,8,0},
      {0,0,0, 4,1,9, 0,0,5},
      {0,0,0, 0,8,0, 0,7,9}
    };

    System.out.println("Tablero inicial:");
    imprimir(tablero);

    long t0 = System.nanoTime();
    resolver(tablero);
    long ms = (System.nanoTime() - t0) / 1_000_000;

    System.out.println("\nSolucion (" + ms + "ms):");
    imprimir(tablero);
  }
}
