const t = String.raw;
import { near } from "./lib.js";

export default {
  title: "Mathematical statistics",
  level: "University: first two years",
  short: "Maximum likelihood, t tests and ANOVA, regression inference, nonparametric tests, power and sample size, Bayesian updating.",
  blurb: "Maximum likelihood estimates, unbiased variance, two-sample and paired t tests, chi-square intervals for a variance, one-way ANOVA, inference for a regression slope, multiple regression, the Mann–Whitney, sign, Fisher, Kolmogorov–Smirnov, Spearman and Kruskal–Wallis procedures, power and sample size, a conjugate prior, and an interval for a difference of proportions.",
  exercises: [
    {
      topic: "Maximum likelihood: exponential",
      q: t`The waiting times 2, 3, 1, 4, 5 come from an exponential distribution with rate \(\lambda\). Find the maximum likelihood estimate of \(\lambda\).`,
      a: t`\(\ell(\lambda) = n\ln\lambda - \lambda\sum x_i\), so \(\hat\lambda = n/\sum x_i = 5/15 = \tfrac13\).`,
      code: `stats.fit([2, 3, 1, 4, 5], "exponential").params.rate`,
      expect: "1/3",
    },
    {
      topic: "Maximum likelihood: Poisson",
      q: t`Counts 2, 0, 3, 1, 4 come from a Poisson distribution. Find the maximum likelihood estimate of its mean.`,
      a: t`\(\hat\lambda = \bar x = 10/5 = 2\).`,
      code: `stats.fit([2, 0, 3, 1, 4], "poisson").params.lambda`,
      expect: "2",
    },
    {
      topic: "Unbiased variance",
      q: t`Find the sample variance \(s^2\) (divisor \(n-1\)) of 3, 5, 7, 9, 11.`,
      a: t`Deviations \(-4,-2,0,2,4\); \(\sum = 40\); \(s^2 = 40/4 = 10\).`,
      code: `stats.variance([3, 5, 7, 9, 11])`,
      expect: "10",
    },
    {
      topic: "Two-sample t test",
      q: t`Group A: 12, 15, 11, 14, 13. Group B: 16, 18, 15, 17, 19. Test equal means with the pooled two-sample \(t\) test. Give \(t\), the degrees of freedom and the two-sided \(p\)-value.`,
      a: t`\(\bar x_A = 13\), \(\bar x_B = 17\), both \(s^2 = 2.5\), pooled \(s_p^2 = 2.5\). \(t = -4/\sqrt{2.5(2/5)} = -4\), 8 df, \(p \approx 0.00395\).`,
      code: `const r = stats.tTest([12, 15, 11, 14, 13], [16, 18, 15, 17, 19], { equalVariance: true });
[r.statistic, r.df, r.pValue]`,
      check: near([-4, 8, 0.0039498], 1e-4),
    },
    {
      topic: "Paired t test",
      q: t`Blood pressure before: 200, 210, 190, 220, 205; after: 195, 200, 192, 210, 198. Test for a change with a paired \(t\) test (two-sided).`,
      a: t`Differences 5, 10, \(-2\), 10, 7: \(\bar d = 6\), \(s_d = \sqrt{24.5}\). \(t = 6/(\sqrt{24.5}/\sqrt5) \approx 2.7105\), 4 df, \(p \approx 0.0535\): not significant at 5%.`,
      code: `const r = stats.tTest([200, 210, 190, 220, 205], [195, 200, 192, 210, 198], { paired: true });
[r.statistic, r.pValue]`,
      check: near([2.7105237, 0.053508], 1e-4),
    },
    {
      topic: "Interval for a variance",
      q: t`A sample of \(n = 10\) from a normal population has \(s^2 = 4\). Give a 95% confidence interval for \(\sigma^2\).`,
      a: t`\(\left(\dfrac{9\cdot4}{\chi^2_{0.975,9}}, \dfrac{9\cdot4}{\chi^2_{0.025,9}}\right) = \left(\dfrac{36}{19.023}, \dfrac{36}{2.7004}\right) \approx (1.8925, 13.331)\).`,
      code: `const X = stats.chiSquare(9);
[R\`36\`.divide(X.quantile("0.975").low), R\`36\`.divide(X.quantile("0.025").low)]`,
      check: near([1.89247, 13.3314], 1e-4),
      status: "partial",
      note: "<code>varianceInterval</code> takes raw data only, so with just \\(n\\) and \\(s^2\\) the interval is built by hand from the chi-square quantiles.",
    },
    {
      topic: "One-way ANOVA",
      q: t`Three groups: \(\{4,5,6\}\), \(\{6,7,8\}\), \(\{9,10,11\}\). Compute the ANOVA \(F\) statistic and its \(p\)-value.`,
      a: t`Means 5, 7, 10, grand mean \(22/3\). \(SS_B = 3(\tfrac{49}{9} + \tfrac19 + \tfrac{64}{9}) = 38\), \(SS_W = 6\). \(F = (38/2)/(6/6) = 19\) on (2, 6) df, \(p \approx 0.00254\).`,
      code: `const r = stats.anova([[4, 5, 6], [6, 7, 8], [9, 10, 11]]);
[r.statistic, r.pValue]`,
      check: near([19, 0.0025357], 1e-4),
    },
    {
      topic: "Inference for a slope",
      q: t`For \(x = 1,\dots,5\) and \(y = 2, 4, 5, 4, 6\), find the least-squares slope, its standard error, the \(t\) statistic and the two-sided \(p\)-value for \(H_0: \beta_1 = 0\).`,
      a: t`\(b_1 = 8/10 = 0.8\). \(SSE = 2.4\), \(s^2 = 0.8\), \(SE = \sqrt{0.8/10} \approx 0.28284\), \(t \approx 2.8284\), 3 df, \(p \approx 0.0663\).`,
      code: `const m = stats.linearModel([1, 2, 3, 4, 5], [2, 4, 5, 4, 6]);
const r = m.test(1);
[m.coefficients[1], r.standardError, r.statistic, r.pValue]`,
      check: near([0.8, 0.2828427, 2.8284271, 0.066276], 1e-4),
    },
    {
      topic: "Coefficient of determination",
      q: t`For the same data, find \(R^2\).`,
      a: t`\(SST = 5.2\), \(SSR = 0.8^2\cdot10 = 6.4\)… more simply \(R^2 = 1 - SSE/SST = 1 - 2.4/8.8 = \tfrac{8}{11}\).`,
      code: `stats.linearModel([1, 2, 3, 4, 5], [2, 4, 5, 4, 6]).rSquared`,
      expect: "8/11",
    },
    {
      topic: "Multiple regression",
      q: t`Fit \(y = b_0 + b_1x_1 + b_2x_2\) to \(x_1 = 1,2,3,4,5\), \(x_2 = 2,1,4,3,5\), \(y = 3,4,8,8,11\).`,
      a: t`Solving the normal equations \(X^TXb = X^Ty\) gives \(b = (\tfrac3{10}, \tfrac43, \tfrac56)\).`,
      code: `stats.linearModel([[1, 2], [2, 1], [3, 4], [4, 3], [5, 5]], [3, 4, 8, 8, 11]).coefficients`,
      expect: "[3/10, 4/3, 5/6]",
    },
    {
      topic: "Mann–Whitney test",
      q: t`Compare \(\{1.1, 2.3, 3.0\}\) with \(\{3.5, 4.1, 5.2, 6.0\}\) by the Mann–Whitney (Wilcoxon rank-sum) test. Give \(U\) and the exact two-sided \(p\)-value.`,
      a: t`Every value in the first sample is below every value in the second, so \(U = 0\). Only 1 of the \(\binom73 = 35\) arrangements is that extreme on each side: \(p = 2/35 \approx 0.0571\).`,
      code: `const r = stats.mannWhitneyTest([1.1, 2.3, 3.0], [3.5, 4.1, 5.2, 6.0]);
[r.statistic, r.pValue]`,
      expect: "[0, 2/35]",
    },
    {
      topic: "Sign test",
      q: t`Of 10 paired differences, 9 are positive and 1 negative. Find the two-sided sign-test \(p\)-value.`,
      a: t`\(2\,P(X \ge 9) = 2\cdot\dfrac{10 + 1}{1024} = \dfrac{22}{1024} = \dfrac{11}{512} \approx 0.0215\).`,
      code: `stats.signTest([1, 1, 1, 1, 1, 1, 1, 1, 1, -1]).pValue`,
      expect: "11/512",
    },
    {
      topic: "Fisher's exact test",
      q: t`Find the two-sided Fisher exact \(p\)-value for the table \(\begin{pmatrix}3&1\\1&3\end{pmatrix}\).`,
      a: t`Hypergeometric probabilities for the top-left cell \(0,\dots,4\): \(\tfrac1{70},\tfrac{16}{70},\tfrac{36}{70},\tfrac{16}{70},\tfrac1{70}\). Tables at most as likely as the observed one: \(p = \tfrac{34}{70} = \tfrac{17}{35}\).`,
      code: `stats.fisherTest([[3, 1], [1, 3]]).pValue`,
      expect: "17/35",
    },
    {
      topic: "Power of a z test",
      q: t`Test \(H_0: \mu = 100\) against \(\mu > 100\) with \(\sigma = 15\), \(n = 25\), \(\alpha = 0.05\). What is the power when the true mean is 106?`,
      a: t`Reject when \(\bar x > 100 + 1.645\cdot3 = 104.935\). Power \(= P(Z > (104.935 - 106)/3) = P(Z > -0.355) \approx 0.6388\).`,
      code: `const Z = stats.normal();
const cut = R\`100\`.add(Z.quantile("0.95").low.multiply(R\`3\`));
R\`1\`.subtract(Z.cdf(cut.subtract(R\`106\`).divide(R\`3\`)).low)`,
      check: near(0.63876, 1e-4),
      status: "partial",
      note: "No power or sample-size function for the standard tests (only the simulation-based <code>powerCurve</code>); the power is assembled from normal quantiles and the CDF.",
    },
    {
      topic: "Sample size",
      q: t`How large a sample gives a margin of error of at most 3 percentage points for a proportion at 95% confidence (use \(p = 0.5\))?`,
      a: t`\(n \ge (1.96/0.03)^2 \cdot 0.25 = 1067.1\), so \(n = 1068\).`,
      code: `const z = stats.normal().quantile("0.975").low;
new Integer(z.divide(R\`0.03\`).pow(2).multiply(R\`1/4\`).ceil())`,
      expect: "1068",
      status: "partial",
      note: "Done by hand from the normal quantile; there is no sample-size helper. (<code>ceil()</code> returns a bigint.)",
    },
    {
      topic: "Conjugate prior",
      q: t`With a uniform Beta(1, 1) prior on a success probability, 7 successes are seen in 10 trials. Give the posterior and its mean.`,
      a: t`Beta(8, 4), with mean \(8/12 = \tfrac23\).`,
      code: `const post = stats.betaPrior(1, 1).update({ successes: 7, trials: 10 });
[post.params, post.mean]`,
      check: (v) => String(v[1]) === "2/3" && JSON.stringify(Object.values(v[0]).map(String)) === '["8","4"]',
      expectText: "[{a: 8, b: 4}, 2/3]",
    },
    {
      topic: "Kolmogorov–Smirnov statistic",
      q: t`Find the Kolmogorov–Smirnov statistic \(D\) for the sample 0.1, 0.4, 0.7 against the uniform distribution on \([0, 1]\).`,
      a: t`Compare \(F(x) = x\) with the step function: at 0.1 the gaps are 0.1 and 0.233, at 0.4 they are 0.267 and 0.067, at 0.7 they are 0.3 and 0.033. \(D = 0.3\).`,
      code: `stats.ksTest([0.1, 0.4, 0.7], stats.uniform(0, 1)).statistic`,
      expect: "3/10",
    },
    {
      topic: "Spearman's rank correlation",
      q: t`Find Spearman's \(\rho\) for \(x = 1,2,3,4,5\) and \(y = 2,1,4,3,5\).`,
      a: t`Rank differences \(-1, 1, -1, 1, 0\), \(\sum d^2 = 4\): \(\rho = 1 - \dfrac{6\cdot4}{5\cdot24} = 0.8\).`,
      code: `stats.spearmanTest([1, 2, 3, 4, 5], [2, 1, 4, 3, 5]).statistic`,
      expect: "4/5",
    },
    {
      topic: "Kruskal–Wallis test",
      q: t`Find the Kruskal–Wallis \(H\) for \(\{1,2,3\}\), \(\{4,5,6\}\), \(\{7,8,9\}\).`,
      a: t`Rank sums 6, 15, 24. \(H = \dfrac{12}{9\cdot10}\left(\dfrac{36 + 225 + 576}{3}\right) - 3\cdot10 = \dfrac{12\cdot279}{90} - 30 = \dfrac{36}{5}\).`,
      code: `stats.kruskalWallisTest([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).statistic`,
      expect: "36/5",
    },
    {
      topic: "Difference of proportions",
      q: t`In two samples of 100, 45 and 30 people agree. Give a 95% confidence interval for \(p_1 - p_2\).`,
      a: t`\(0.15 \pm 1.96\sqrt{\tfrac{0.45\cdot0.55}{100} + \tfrac{0.3\cdot0.7}{100}} = 0.15 \pm 1.96(0.06745) \approx (0.0174, 0.2826)\).`,
      code: `const I = stats.proportionTest([45, 30], [100, 100]).interval();
[I.low, I.high]`,
      check: near([0.01743, 0.28257], 1e-3),
    },
  ],
};
