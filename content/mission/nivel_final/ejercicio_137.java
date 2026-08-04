// Mini compilador de expresiones aritméticas: lexer + parser recursivo
// descendente + AST + evaluador. Gramática (LL(1)):
//   E -> T (('+' | '-') T)*
//   T -> F (('*' | '/') F)*
//   F -> NUM | '(' E ')'

import java.util.ArrayList;
import java.util.List;

public class ejercicio_137 {

  static class Token {
    final String tipo;
    final double valor;
    Token(String tipo, double valor) { this.tipo = tipo; this.valor = valor; }
    public String toString() { return "Token[tipo=" + tipo + ", valor=" + valor + "]"; }
  }

  static abstract class Nodo {}
  static class Num extends Nodo {
    final double valor;
    Num(double valor) { this.valor = valor; }
  }
  static class Bin extends Nodo {
    final String op;
    final Nodo izq, der;
    Bin(String op, Nodo izq, Nodo der) { this.op = op; this.izq = izq; this.der = der; }
  }

  static List<Token> lexer(String src) {
    List<Token> tokens = new ArrayList<Token>();
    int i = 0;
    while (i < src.length()) {
      char c = src.charAt(i);
      if (Character.isWhitespace(c)) { i++; continue; }
      if (Character.isDigit(c) || c == '.') {
        int j = i;
        while (j < src.length() && (Character.isDigit(src.charAt(j)) || src.charAt(j) == '.')) j++;
        tokens.add(new Token("NUM", Double.parseDouble(src.substring(i, j))));
        i = j;
        continue;
      }
      String tipo;
      switch (c) {
        case '+': tipo = "MAS"; break;
        case '-': tipo = "MENOS"; break;
        case '*': tipo = "POR"; break;
        case '/': tipo = "DIV"; break;
        case '(': tipo = "ABRE"; break;
        case ')': tipo = "CIERRA"; break;
        default: throw new RuntimeException("caracter invalido: " + c);
      }
      tokens.add(new Token(tipo, 0));
      i++;
    }
    tokens.add(new Token("FIN", 0));
    return tokens;
  }

  static int pos;
  static List<Token> tokens;

  static Nodo parseE() {
    Nodo n = parseT();
    while (((Token) tokens.get(pos)).tipo.equals("MAS") || ((Token) tokens.get(pos)).tipo.equals("MENOS")) {
      String op = ((Token) tokens.get(pos)).tipo.equals("MAS") ? "+" : "-";
      pos++;
      n = new Bin(op, n, parseT());
    }
    return n;
  }

  static Nodo parseT() {
    Nodo n = parseF();
    while (((Token) tokens.get(pos)).tipo.equals("POR") || ((Token) tokens.get(pos)).tipo.equals("DIV")) {
      String op = ((Token) tokens.get(pos)).tipo.equals("POR") ? "*" : "/";
      pos++;
      n = new Bin(op, n, parseF());
    }
    return n;
  }

  static Nodo parseF() {
    Token t = (Token) tokens.get(pos);
    if (t.tipo.equals("NUM")) { pos++; return new Num(t.valor); }
    if (t.tipo.equals("ABRE")) {
      pos++;
      Nodo n = parseE();
      pos++; // consume )
      return n;
    }
    throw new RuntimeException("token inesperado en pos " + pos);
  }

  static double eval(Nodo n) {
    if (n instanceof Num) return ((Num) n).valor;
    if (n instanceof Bin) {
      Bin b = (Bin) n;
      double i = eval(b.izq);
      double d = eval(b.der);
      if (b.op.equals("+")) return i + d;
      if (b.op.equals("-")) return i - d;
      if (b.op.equals("*")) return i * d;
      if (b.op.equals("/")) return i / d;
      throw new RuntimeException("op desconocida: " + b.op);
    }
    throw new RuntimeException("nodo desconocido");
  }

  static String pretty(Nodo n, int depth) {
    StringBuilder pad = new StringBuilder();
    for (int i = 0; i < depth; i++) pad.append("  ");
    if (n instanceof Num) return pad + Double.toString(((Num) n).valor);
    if (n instanceof Bin) {
      Bin b = (Bin) n;
      return pad + "(" + b.op + "\n" + pretty(b.izq, depth + 1)
          + "\n" + pretty(b.der, depth + 1) + ")";
    }
    return "?";
  }

  public static void main(String[] args) {
    String expr = "(3 + 4) * 2 - 1 / (5 - 3)";
    System.out.println("Expresion: " + expr);

    tokens = lexer(expr);
    System.out.println("\nTokens:\n" + tokens);

    pos = 0;
    Nodo ast = parseE();
    System.out.println("\nAST:\n" + pretty(ast, 0));

    System.out.println("\nResultado: " + eval(ast));
  }
}
