// MLP 2-3-1 aprendiendo XOR con backpropagation. Sigmoides, SGD por ejemplo,
// 4000 epochs. Sin librerías — matrices como arrays a mano.

import java.util.Random;

public class ejercicio_314 {
  static final int OCULTAS = 3;
  static final int EPOCAS = 4000;
  static final double LR = 0.5;

  static double[][] X = { {0,0}, {0,1}, {1,0}, {1,1} };
  static double[]   Y = { 0, 1, 1, 0 };

  static double sig(double x) { return 1.0 / (1.0 + Math.exp(-x)); }
  static double dsig(double y) { return y * (1 - y); }

  public static void main(String[] args) {
    Random rnd = new Random(42);
    double[][] W1 = new double[OCULTAS][2];
    double[]   b1 = new double[OCULTAS];
    double[]   W2 = new double[OCULTAS];
    double     b2 = rnd.nextDouble() * 2 - 1;
    for (int i = 0; i < OCULTAS; i++) {
      b1[i] = rnd.nextDouble() * 2 - 1;
      W2[i] = rnd.nextDouble() * 2 - 1;
      for (int j = 0; j < 2; j++) W1[i][j] = rnd.nextDouble() * 2 - 1;
    }

    System.out.println("Entrenando MLP 2-" + OCULTAS + "-1 sobre XOR (lr=" + LR
        + ", epochs=" + EPOCAS + ")");
    System.out.println("\nLoss:");

    for (int ep = 0; ep < EPOCAS; ep++) {
      double loss = 0;
      for (int k = 0; k < X.length; k++) {
        double[] x = X[k];
        double y = Y[k];
        double[] h = new double[OCULTAS];
        for (int i = 0; i < OCULTAS; i++) {
          double z = b1[i];
          for (int j = 0; j < 2; j++) z += W1[i][j] * x[j];
          h[i] = sig(z);
        }
        double zo = b2;
        for (int i = 0; i < OCULTAS; i++) zo += W2[i] * h[i];
        double o = sig(zo);

        double err = o - y;
        loss += err * err;
        double dO = err * dsig(o);
        for (int i = 0; i < OCULTAS; i++) {
          double dH = dO * W2[i] * dsig(h[i]);
          W2[i] -= LR * dO * h[i];
          for (int j = 0; j < 2; j++) W1[i][j] -= LR * dH * x[j];
          b1[i] -= LR * dH;
        }
        b2 -= LR * dO;
      }
      if (ep == 0 || ep == 100 || ep == 500 || ep == 1000 || ep == 2000 || ep == EPOCAS-1) {
        System.out.printf("  ep %4d   loss=%.6f%n", ep, loss);
      }
    }

    System.out.println("\nPredicciones finales:");
    for (int k = 0; k < X.length; k++) {
      double[] x = X[k];
      double[] h = new double[OCULTAS];
      for (int i = 0; i < OCULTAS; i++) {
        double z = b1[i];
        for (int j = 0; j < 2; j++) z += W1[i][j] * x[j];
        h[i] = sig(z);
      }
      double zo = b2;
      for (int i = 0; i < OCULTAS; i++) zo += W2[i] * h[i];
      double o = sig(zo);
      System.out.printf("  (%.0f,%.0f) -> %.4f   (esperado %.0f)%n", x[0], x[1], o, Y[k]);
    }
  }
}
