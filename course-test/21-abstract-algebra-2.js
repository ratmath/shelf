const t = String.raw;

export default {
  title: "Abstract algebra II: rings, fields and Galois theory",
  level: "University: upper level",
  short: "Polynomial rings, irreducibility, quotient rings and ideals, finite fields, field extensions and degrees, Galois groups, solvability, constructibility.",
  blurb: "Polynomial gcds and factoring over \(\mathbb Q\), Eisenstein's criterion, quotient rings that are or are not fields, Gröbner bases, unique factorisation failing in \(\mathbb Z[\sqrt{-5}]\), arithmetic in \(\mathrm{GF}(8)\), Conway polynomials, minimal polynomials and primitive elements, degrees of towers, Galois groups of cubics, quartics and quintics, the discriminant test, solving by radicals, ruler-and-compass constructions, cyclotomic polynomials and the Smith normal form.",
  exercises: [
    {
      topic: "Polynomial gcd",
      q: t`Find \(\gcd(x^3 - 1, x^2 - 1)\) in \(\mathbb Q[x]\).`,
      a: t`\(x^3 - 1 = (x - 1)(x^2 + x + 1)\) and \(x^2 - 1 = (x - 1)(x + 1)\); \(x^2 + x + 1\) has no root \(-1\), so the gcd is \(x - 1\).`,
      code: `const P = structures.polynomialDomain("x");
String(structures.gcd(P.from("x^3 - 1"), P.from("x^2 - 1")))`,
      expect: "x − 1",
    },
    {
      topic: "Factoring over Q",
      q: t`Factor \(x^4 + 4\) over \(\mathbb Q\).`,
      a: t`Sophie Germain: \(x^4 + 4 = (x^2 + 2)^2 - (2x)^2 = (x^2 + 2x + 2)(x^2 - 2x + 2)\).`,
      code: `const R = structures.ring(["x"]);
structures.factor(R.poly("x^4 + 4")).factors.map((f) => String(f.factor))`,
      expect: `["x² + 2x + 2", "x² − 2x + 2"]`,
      note: "<code>factor</code> and <code>isIrreducible</code> need a polynomial built with <code>ring([...]).poly</code>, while <code>gcd</code> needs one from <code>polynomialDomain(v).from</code>; neither takes plain text.",
    },
    {
      topic: "Irreducibility",
      q: t`Which are irreducible over \(\mathbb Q\): \(x^3 - 2\), \(x^4 + 4\), \(x^4 + 6x + 3\)?`,
      a: t`\(x^3 - 2\): a reducible cubic has a rational root, and \(\pm1, \pm2\) are not roots; irreducible. \(x^4 + 4\): reducible (previous exercise). \(x^4 + 6x + 3\): Eisenstein at 3; irreducible.`,
      code: `const R = structures.ring(["x"]);
["x^3 - 2", "x^4 + 4", "x^4 + 6*x + 3"].map((f) => structures.isIrreducible(R.poly(f)))`,
      expect: "[true, false, true]",
    },
    {
      topic: "Quotient rings",
      q: t`Is \(\mathbb Q[x]/(x^2 + 1)\) a field? Is \(\mathbb Q[x]/(x^2 - 1)\) an integral domain?`,
      a: t`\(x^2 + 1\) is irreducible, so \((x^2 + 1)\) is maximal: a field (\(\cong \mathbb Q(i)\)). \(x^2 - 1 = (x-1)(x+1)\): \((x - 1)(x + 1) = 0\) in the quotient, so it is not a domain.`,
      code: `const R = structures.ring(["x"]);
const Q = (f) => structures.ideal(R, [R.poly(f)]).quotientRing();
[Q("x^2 + 1").isField(), Q("x^2 - 1").isIntegralDomain()]`,
      expect: "[true, false]",
      note: "Here <code>isField</code> is a method, while on <code>Zn(7)</code> it is a getter.",
    },
    {
      topic: "Gröbner bases",
      q: t`Find a reduced Gröbner basis (lex, \(x > y\)) of the ideal \((x^2 + y^2 - 1,\ x - y)\).`,
      a: t`Substitute \(x = y\): \(2y^2 - 1\). Basis \(\{x - y,\ y^2 - \tfrac12\}\).`,
      code: `const R = structures.ring(["x", "y"], { order: "lex" });
String(structures.groebner([R.poly("x^2 + y^2 - 1"), R.poly("x - y")]))`,
      expect: "Gröbner basis (lex) of 2: y² − 1/2, x − y",
    },
    {
      topic: "Unique factorisation fails",
      q: t`Show \(\mathbb Z[\sqrt{-5}]\) is not a UFD. What is its class number?`,
      a: t`\(6 = 2\cdot3 = (1 + \sqrt{-5})(1 - \sqrt{-5})\), with all four factors irreducible (norms 4, 9, 6, 6, and no element has norm 2 or 3) and not associates. The class number is 2.`,
      code: `const R = structures.quadraticRing(-5);
[R.classNumber(), R.isUFD]`,
      expect: "[2, false]",
    },
    {
      topic: "Finite fields",
      q: t`In \(\mathrm{GF}(8) = \mathbb F_2[a]/(a^3 + a + 1)\), find \((a + 1)^{-1}\).`,
      a: t`\((a + 1)(a^2 + a) = a^3 + a = (a + 1) + a = 1\), so \((a + 1)^{-1} = a^2 + a\).`,
      code: `const F = structures.galoisField(2, 3, [1, 1, 0, 1]);
F.format(F.inv(F.add(F.gen, F.one)))`,
      expect: "a² + a",
    },
    {
      topic: "Primitive polynomials",
      q: t`Give the Conway polynomial for \(\mathrm{GF}(16)\), that is, the least primitive polynomial of degree 4 over \(\mathbb F_2\).`,
      a: t`The irreducible quartics over \(\mathbb F_2\) are \(x^4 + x + 1\), \(x^4 + x^3 + 1\), \(x^4 + x^3 + x^2 + x + 1\); the last has roots of order 5, and \(x^4 + x + 1\) comes first: \(x^4 + x + 1\).`,
      code: `structures.conwayPolynomial(2, 4)`,
      expect: "[1, 1, 0, 0, 1]",
      note: "The answer is a list of coefficients, constant term first.",
    },
    {
      topic: "Minimal polynomials",
      q: t`Find the minimal polynomial of \(\sqrt2 + \sqrt3\) over \(\mathbb Q\).`,
      a: t`\(\alpha^2 = 5 + 2\sqrt6\), \((\alpha^2 - 5)^2 = 24\): \(x^4 - 10x^2 + 1\), irreducible since \([\mathbb Q(\sqrt2, \sqrt3):\mathbb Q] = 4\).`,
      code: `const A = algebraic;
A.minimalPolynomial(A.add(A.sqrt(A.fromRational(2)), A.sqrt(A.fromRational(3))))`,
      expect: "[1, 0, -10, 0, 1]",
    },
    {
      topic: "Primitive element",
      q: t`Find a primitive element of \(\mathbb Q(\sqrt2, \sqrt3)\) and the degree of the extension.`,
      a: t`Degree 4 (\(\sqrt3 \notin \mathbb Q(\sqrt2)\)); \(\sqrt2 + \sqrt3\) is primitive.`,
      code: `const E = structures.extension({ a: "a^2 - 2", b: "b^2 - 3" });
[E.degreeOver(), String(E.primitiveElement().element)]`,
      expect: `[4, "a + b"]`,
    },
    {
      topic: "Degree of a tower",
      q: t`Find \([\mathbb Q(\sqrt[3]2, \omega) : \mathbb Q]\) where \(\omega\) is a primitive cube root of unity.`,
      a: t`\([\mathbb Q(\sqrt[3]2):\mathbb Q] = 3\) and \(\omega\) satisfies \(x^2 + x + 1\), not real, so degree \(3\cdot2 = 6\).`,
      code: `structures.extension({ a: "a^3 - 2", w: "w^2 + w + 1" }).degreeOver()`,
      expect: "6",
    },
    {
      topic: "Galois group of a cubic",
      q: t`Find the Galois group of \(x^3 - 2\) over \(\mathbb Q\).`,
      a: t`Irreducible with discriminant \(-27\cdot4 = -108\), not a square: \(S_3\), order 6.`,
      code: `const g = algebraic.galoisGroup([-2n, 0n, 0n, 1n]);
[g.name, g.order, g.discriminant]`,
      expect: `["S3", 6, -108]`,
    },
    {
      topic: "Discriminant test",
      q: t`Find the Galois group of \(x^3 - 3x + 1\).`,
      a: t`Irreducible (no rational roots), discriminant \(-4(-3)^3 - 27 = 81 = 9^2\), a square: \(A_3 \cong C_3\).`,
      code: `const g = algebraic.galoisGroup([1n, -3n, 0n, 1n]);
[g.name, g.discriminant, g.discriminantIsSquare]`,
      expect: `["C3", 81, true]`,
    },
    {
      topic: "Galois group of x⁴ − 2",
      q: t`Find the Galois group of \(x^4 - 2\) over \(\mathbb Q\).`,
      a: t`Splitting field \(\mathbb Q(\sqrt[4]2, i)\) of degree 8; the group is the dihedral group \(D_4\) of order 8.`,
      code: `const g = algebraic.galoisGroup([-2n, 0n, 0n, 0n, 1n]);
[g.name, g.order]`,
      expect: `["D4", 8]`,
    },
    {
      topic: "Biquadratic extension",
      q: t`Find the Galois group of \(x^4 - 10x^2 + 1\).`,
      a: t`Its roots \(\pm\sqrt2 \pm\sqrt3\) generate \(\mathbb Q(\sqrt2, \sqrt3)\) of degree 4, with automorphisms flipping each sign: \(V_4 \cong C_2\times C_2\).`,
      code: `const g = algebraic.galoisGroup([1n, 0n, -10n, 0n, 1n]);
[g.name, g.order]`,
      expect: `["V4", 4]`,
    },
    {
      topic: "An unsolvable quintic",
      q: t`Is \(x^5 - x - 1\) solvable by radicals?`,
      a: t`It is irreducible (mod 5 it is the Artin–Schreier polynomial, irreducible), and its Galois group is \(S_5\), which is not solvable. So no.`,
      code: `const g = algebraic.galoisGroup([-1n, -1n, 0n, 0n, 0n, 1n]);
[g.name, g.solvable]`,
      expect: `["S5", false]`,
    },
    {
      topic: "Constructibility: the 7-gon",
      q: t`Is the regular heptagon constructible with ruler and compass?`,
      a: t`\(\cos\frac{2\pi}7\) is a root of \(8x^3 + 4x^2 - 4x - 1\), irreducible of degree 3, not a power of 2: not constructible.`,
      code: `structures.constructible(algebraic.cosMinimal(7)).constructible`,
      expect: "false",
    },
    {
      topic: "Constructibility: the 17-gon",
      q: t`Is the regular 17-gon constructible?`,
      a: t`Yes (Gauss): 17 is a Fermat prime, \(\varphi(17) = 16 = 2^4\), and \(\mathbb Q(\cos\frac{2\pi}{17})\) is an abelian extension of degree 8.`,
      code: `const c = structures.constructible(algebraic.cosMinimal(17));
[c.constructible, c.factors[0].cosine.n]`,
      expect: "[true, 17]",
      note: "The degree is 8, beyond the Galois groups computed directly, but the polynomial is recognised as the minimal polynomial of \\(\\cos(2\\pi/17)\\), so Gauss–Wantzel decides it.",
      fix: "structures#6",
    },
    {
      topic: "Cyclotomic polynomials",
      q: t`Find the cyclotomic polynomial \(\Phi_{12}(x)\).`,
      a: t`\(\Phi_{12} = \dfrac{(x^{12} - 1)(x^2 - 1)}{(x^6 - 1)(x^4 - 1)} = x^4 - x^2 + 1\).`,
      code: `algebraic.cyclotomic(12)`,
      expect: "[1, 0, -1, 0, 1]",
    },
    {
      topic: "Smith normal form",
      q: t`Find the Smith normal form of \(\begin{pmatrix}2&4&4\\-6&6&12\\10&-4&-16\end{pmatrix}\) and the abelian group \(\mathbb Z^3\) modulo its columns.`,
      a: t`\(d_1 = \gcd\) of entries \(= 2\); \(d_1d_2 = \gcd\) of \(2\times2\) minors \(= 12\); \(d_1d_2d_3 = |\det| = 144\). So \(\operatorname{diag}(2, 6, 12)\) and the cokernel is \(\mathbb Z_2\times\mathbb Z_6\times\mathbb Z_{12}\).`,
      code: `structures.smithForm([[2, 4, 4], [-6, 6, 12], [10, -4, -16]]).diagonal`,
      expect: "[2, 6, 12]",
    },
  ],
};
