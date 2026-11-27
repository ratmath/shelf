const t = String.raw;
import { near } from "./lib.js";

export default {
  title: "High-school statistics (AP Statistics)",
  level: "School: high school",
  short: "Describing data, normal distributions, correlation and regression, probability, sampling distributions, inference.",
  blurb: "Summary statistics, z-scores and normal calculations, correlation and least-squares residuals, binomial probabilities, expected value, conditional probability and Bayes' rule, sampling distributions, confidence intervals for a proportion and a mean, and tests for a proportion, a mean, goodness of fit and independence.",
  exercises: [
    {
      topic: "Mean and standard deviation",
      q: t`For the data 2, 4, 4, 4, 5, 5, 7, 9 find the mean, the sample standard deviation and the population standard deviation.`,
      a: t`Mean 5; squared deviations sum to 32; \(s = \sqrt{32/7} \approx 2.138\); \(\sigma = \sqrt{32/8} = 2\).`,
      code: `const d = [2, 4, 4, 4, 5, 5, 7, 9];
[stats.mean(d), stats.variance(d), stats.sd(d), stats.sd(d, { population: true })]`,
      check: (v) => String(v[0]) === "5" && String(v[1]) === "32/7" && Math.abs(Number(v[2].low?.toNumber?.() ?? v[2].toNumber()) - 2.13809) < 1e-4 && String(v[3]) === "2",
      expectText: "[5, 32/7, 2.1381…, 2]",
    },
    {
      topic: "z-scores",
      q: t`A test has mean 72 and standard deviation 8. What is the z-score of a mark of 86?`,
      a: t`\((86 - 72)/8 = 1.75\).`,
      code: "R`(86 - 72)/8`",
      expect: "7/4",
    },
    {
      topic: "Normal probability",
      q: t`Find \(P(Z < 1.75)\) for a standard normal \(Z\), to four decimals.`,
      a: t`0.9599 (table: 0.95994).`,
      code: "stats.normal().cdf(R`7/4`)",
      check: near(0.9599408, 1e-6),
    },
    {
      topic: "Normal proportion between values",
      q: t`Heights are normal with mean 64 in and standard deviation 2.5 in. What proportion lie between 60 and 68 inches?`,
      a: t`\(z = \pm 1.6\): \(2\Phi(1.6) - 1 \approx 0.8904\).`,
      code: "stats.normal(64, R`2.5`).prob(60, 68)",
      check: near(0.8904014, 1e-6),
    },
    {
      topic: "Inverse normal",
      q: t`Scores are normal with mean 500 and standard deviation 100. What score is the 90th percentile?`,
      a: t`\(500 + 1.2816 \times 100 \approx 628.2\).`,
      code: "stats.normal(500, 100).quantile(R`0.9`)",
      check: near(628.1551566, 1e-6),
    },
    {
      topic: "Correlation",
      q: t`Find the correlation of \((1, 2), (2, 4), (3, 5), (4, 4), (5, 6)\).`,
      a: t`\(S_{xy} = 8\), \(S_{xx} = 10\), \(S_{yy} = 8.8\): \(r = 8/\sqrt{88} \approx 0.8528\).`,
      code: "stats.correlation([1, 2, 3, 4, 5], [2, 4, 5, 4, 6])",
      check: near(0.8528029, 1e-6),
    },
    {
      topic: "Residuals",
      q: t`For the same data the least-squares line is \(\hat y = 0.8x + 1.8\). Find the residual at \((3, 5)\).`,
      a: t`\(\hat y = 4.2\); residual \(5 - 4.2 = 0.8\).`,
      code: "stats.leastSquares([1, 2, 3, 4, 5], [2, 4, 5, 4, 6]).residuals[2]",
      expect: "4/5",
    },
    {
      topic: "Binomial probability",
      q: t`\(X\) is binomial with \(n = 10\), \(p = 0.3\). Find \(P(X = 3)\).`,
      a: t`\(\binom{10}{3}(0.3)^3(0.7)^7 = 0.266828\) (exactly \(0.2668279320\)).`,
      code: "stats.binomial(10, R`0.3`).pmf(3).toDecimal()",
      expect: "0.266827932",
    },
    {
      topic: "Binomial cumulative",
      q: t`For the same \(X\), find \(P(X \le 2)\).`,
      a: t`\(0.7^{10} + 10(0.3)(0.7)^9 + 45(0.09)(0.7)^8 = 0.3827827864\).`,
      code: "stats.binomial(10, R`0.3`).cdf(2).toDecimal()",
      expect: "0.3827827864",
    },
    {
      topic: "Expected value",
      q: t`A game costs \$1. Roll a die: on a 6 you get \$6 back (a \$5 gain), otherwise nothing. What is the expected gain?`,
      a: t`\(5 \cdot \tfrac16 - 1 \cdot \tfrac56 = 0\). A fair game.`,
      code: "stats.die().mean((x) => (x === 6 ? 5 : -1))",
      expect: "0",
    },
    {
      topic: "Conditional probability",
      q: t`Of 50 students who studied, 45 passed; of 50 who did not, 15 passed. Find \(P(\text{pass}\mid\text{studied})\) and \(P(\text{studied}\mid\text{pass})\).`,
      a: t`\(45/50 = 0.9\); \(45/60 = 0.75\).`,
      code: `const table = stats.finite(new Map([[["S", "P"], 45], [["S", "F"], 5], [["N", "P"], 15], [["N", "F"], 35]]), { normalize: true });
[table.prob(([s, r]) => r === "P", ([s]) => s === "S"), table.prob(([s]) => s === "S", ([, r]) => r === "P")]`,
      expect: "[9/10, 3/4]",
    },
    {
      topic: "Bayes' rule",
      q: t`A disease affects 1% of people. A test detects it 95% of the time and gives a false positive 5% of the time. Given a positive test, what is the probability of disease?`,
      a: t`\(\dfrac{0.0095}{0.0095 + 0.0495} = \dfrac{19}{118} \approx 0.161\).`,
      code: `stats.bayes({ sick: "0.01", well: "0.99" }, { sick: "0.95", well: "0.05" }).posterior.p("sick")`,
      expect: "19/118",
    },
    {
      topic: "Sampling distribution of the mean",
      q: t`A population has mean 50 and standard deviation 12. For samples of 36, find \(P(\bar x > 53)\).`,
      a: t`SE \(= 12/6 = 2\); \(P(Z > 1.5) \approx 0.0668\).`,
      code: "stats.normal(50, 2).sf(53)",
      check: near(0.0668072, 1e-6),
    },
    {
      topic: "Confidence interval for a proportion",
      q: t`In a poll, 540 of 900 people say yes. Give a 95% confidence interval for the proportion.`,
      a: t`\(\hat p = 0.6\), SE \(= \sqrt{0.24/900} = 0.01633\); \(0.6 \pm 1.96(0.01633)\): \((0.568, 0.632)\).`,
      code: `const ci = stats.proportionInterval(540, 900, { method: "wald" });
[ci.low, ci.high]`,
      check: near([0.5679939, 0.6320061], 1e-5),
    },
    {
      topic: "Confidence interval for a mean",
      q: t`A sample of 16 has mean 25.3 and standard deviation 4.2. Give a 95% \(t\) interval for the mean.`,
      a: t`\(t^* = 2.131\) (15 df), SE \(= 1.05\): \(25.3 \pm 2.238 = (23.06, 27.54)\).`,
      code: "const ci = stats.meanInterval({ n: 16, mean: \"25.3\", sd: \"4.2\" });\n[ci.low, ci.high]",
      check: near([23.061978, 27.538022], 1e-5),
      note: "<code>meanInterval</code> takes the summary \\((n, \\bar x, s)\\) directly.",
      fix: "stats#8",
    },
    {
      topic: "Test for a proportion",
      q: t`Test \(H_0: p = 0.5\) against \(p \ne 0.5\) when 62 of 100 trials succeed. Give \(z\) and the P-value.`,
      a: t`\(z = 0.12/0.05 = 2.4\), \(P = 2(0.0082) = 0.0164\).`,
      code: `const r = stats.proportionTest(62, 100, R\`1/2\`);
[r.statistic, r.pValue]`,
      check: (v) => Math.abs(Number(String(v[0]).includes("/") ? eval(String(v[0])) : v[0].toNumber?.() ?? v[0]) - 2.4) < 1e-9 && Math.abs((v[1].low?.toNumber?.() ?? v[1].toNumber()) - 0.0163951) < 1e-6,
      expectText: "[12/5, 0.0163951]",
    },
    {
      topic: "One-sample t test",
      q: t`Test \(H_0: \mu = 5\) against \(\mu \ne 5\) for the data 5.1, 4.9, 5.6, 5.8, 6.0, 5.3, 5.5, 5.9.`,
      a: t`\(\bar x = 5.5125\), \(s = 0.39074\), \(t = 3.710\) on 7 df, \(P \approx 0.0076\).`,
      work: t`SciPy: t = 3.70979, p = 0.007557.`,
      code: `const r = stats.tTest(["5.1", "4.9", "5.6", "5.8", "6.0", "5.3", "5.5", "5.9"], { mu: 5 });
[r.statistic, r.pValue]`,
      check: near([3.7097942, 0.0075569], 1e-5),
    },
    {
      topic: "Goodness of fit",
      q: t`A die rolled 60 times gives counts 8, 12, 9, 11, 6, 14. Is it fair? Give \(\chi^2\) and the P-value.`,
      a: t`Expected 10 each: \(\chi^2 = 42/10 = 4.2\), 5 df, \(P \approx 0.521\). No evidence of unfairness.`,
      code: `const r = stats.chiSquareTest([8, 12, 9, 11, 6, 14]);
[r.statistic, r.pValue]`,
      check: (v) => String(v[0]) === "21/5" && Math.abs((v[1].low?.toNumber?.() ?? v[1].toNumber()) - 0.520995) < 1e-5,
      expectText: "[21/5, 0.520995]",
    },
    {
      topic: "Test of independence",
      q: t`Test whether studying and passing are independent, using the table of exercise 11 (no continuity correction).`,
      a: t`Expected counts 30, 20, 30, 20: \(\chi^2 = 37.5\), 1 df, \(P \approx 9.1 \times 10^{-10}\). Strong evidence of association.`,
      code: `const r = stats.chiSquareTest([[45, 5], [15, 35]], { correct: false });
[r.statistic, r.pValue]`,
      check: (v) => String(v[0]) === "75/2" && Math.abs((v[1].low?.toNumber?.() ?? v[1].toNumber()) - 9.1413e-10) < 1e-13,
      expectText: "[75/2, 9.1413e-10]",
    },
    {
      topic: "At least one",
      q: t`What is the probability of at least one 6 in four rolls of a die?`,
      a: t`\(1 - (5/6)^4 = 671/1296 \approx 0.518\).`,
      code: "stats.die().power(4).prob((r) => r.includes(6))",
      expect: "671/1296",
    },
  ],
};
