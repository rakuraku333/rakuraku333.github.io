// Ray tracer ASCII: 3 esferas con Lambert shading contra una luz direccional.
// Salida: 78x30 caracteres con gradiente " .:-=+*#%@" según intensidad. Sin
// dependencias, sin buffers de imagen — se imprime al stdout como escena.

public class ejercicio_256 {
  static final int ANCHO = 78, ALTO = 30;
  static final String PALETA = " .:-=+*#%@";
  static final double[][] ESFERAS = {
    { 0.0,  0.0, 3.5, 1.4 },
    { 1.5,  0.8, 2.7, 0.6 },
    {-1.7, -0.5, 4.5, 1.6 },
  };
  static final double[] LUZ_DIR = normalizar(new double[]{ -1, 1.4, -0.8 });

  static double[] normalizar(double[] v) {
    double m = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return new double[]{ v[0]/m, v[1]/m, v[2]/m };
  }

  static double dot(double[] a, double[] b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  }

  // Devuelve t > 0 del hit más cercano, o -1 si el rayo no toca la esfera.
  static double intersectar(double[] origen, double[] dir, double[] esfera) {
    double[] oc = { origen[0]-esfera[0], origen[1]-esfera[1], origen[2]-esfera[2] };
    double b = dot(oc, dir);
    double c = dot(oc, oc) - esfera[3]*esfera[3];
    double disc = b*b - c;
    if (disc < 0) return -1;
    double t = -b - Math.sqrt(disc);
    return t > 0 ? t : -1;
  }

  public static void main(String[] args) {
    StringBuilder salida = new StringBuilder();
    double[] origen = { 0, 0, 0 };

    for (int y = 0; y < ALTO; y++) {
      for (int x = 0; x < ANCHO; x++) {
        double u = (x - ANCHO/2.0) / (ANCHO/2.0) * 1.5;
        double v = -(y - ALTO/2.0) / (ALTO/2.0) * 0.75;
        double[] dir = normalizar(new double[]{ u, v, 1 });

        double tMin = Double.POSITIVE_INFINITY;
        int hit = -1;
        for (int i = 0; i < ESFERAS.length; i++) {
          double t = intersectar(origen, dir, ESFERAS[i]);
          if (t > 0 && t < tMin) { tMin = t; hit = i; }
        }

        if (hit == -1) { salida.append(' '); continue; }
        double[] p = { origen[0] + dir[0]*tMin,
                       origen[1] + dir[1]*tMin,
                       origen[2] + dir[2]*tMin };
        double[] esf = ESFERAS[hit];
        double[] n = normalizar(new double[]{ p[0]-esf[0], p[1]-esf[1], p[2]-esf[2] });
        double luz = Math.max(0, dot(n, LUZ_DIR));
        int idx = Math.min(PALETA.length()-1, (int)(luz * PALETA.length()));
        salida.append(PALETA.charAt(idx));
      }
      salida.append('\n');
    }
    System.out.print(salida);
  }
}
