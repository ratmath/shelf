import { near } from "./lib.js";
const t = String.raw;

export default {
  title: "Financial mathematics",
  level: "University: upper level",
  short: "Interest and rates, annuities, loans, cash-flow analysis, bonds, the term structure, options, life contingencies.",
  blurb: "Effective and continuous rates, annuities and perpetuities, amortised loans, net present value and internal rate of return, bond prices, yields and duration, forward rates, Black–Scholes and binomial option prices, option strategies, depreciation and a first life table.",
  exercises: [
    {
      topic: "Effective rate",
      q: t`What effective annual rate corresponds to 6% compounded monthly?`,
      a: t`\((1 + 0.06/12)^{12} - 1 = 1.005^{12} - 1 \approx 6.16778\%\).`,
      code: `finance.effectiveRate("6%", 12)`,
      check: near(0.06167781186449828, 1e-12),
    },
    {
      topic: "Compound interest",
      q: t`What does \$1000 grow to in 10 years at 5% compounded annually?`,
      a: t`\(1000 \cdot 1.05^{10} \approx \$1628.89\).`,
      code: `finance.compound(1000, "5%", 10)`,
      check: near(1628.894626777442, 1e-9),
    },
    {
      topic: "Continuous compounding",
      q: t`What does \$1000 grow to in 10 years at 5% compounded continuously?`,
      a: t`\(1000e^{0.5} \approx \$1648.72\).`,
      code: `R\`1000\`.multiply(finance.exp(R\`5/100 * 10\`))`,
      check: near(1648.7212707001282, 1e-8),
    },
    {
      topic: "Annuity-immediate",
      q: t`Find the present value of \$100 paid at the end of each year for 10 years at 5%.`,
      a: t`\(100\,a_{\overline{10}|} = 100\cdot\frac{1 - 1.05^{-10}}{0.05} \approx \$772.17\).`,
      code: `finance.annuity({ payment: 100, rate: "5%", periods: 10 }).presentValue`,
      check: near(772.1734929184818, 1e-8),
    },
    {
      topic: "Annuity-due",
      q: t`The same payments are made at the start of each year instead. Find the present value.`,
      a: t`\(100\,\ddot a_{\overline{10}|} = 1.05 \times 772.173493 \approx \$810.78\).`,
      code: `finance.annuity({ payment: 100, rate: "5%", periods: 10, due: true }).presentValue`,
      check: near(810.7821675644059, 1e-8),
    },
    {
      topic: "Growing perpetuity",
      q: t`A perpetuity pays \$100 next year, growing by 2% a year after that. At 6%, what is it worth?`,
      a: t`\(\frac{100}{0.06 - 0.02} = \$2500\).`,
      code: `finance.perpetuity({ payment: 100, rate: "6%", growth: "2%" })`,
      expect: "2500",
    },
    {
      topic: "Loan payment",
      q: t`Find the monthly payment on a \$250{,}000, 30-year loan at 6% a year compounded monthly.`,
      a: t`\(250000 \cdot \frac{0.005}{1 - 1.005^{-360}} \approx \$1498.88\).`,
      code: `finance.loan({ principal: 250000, rate: "6%", periods: 360 }).payment`,
      expect: "1498.88",
      check: near(1498.88, 0.0051),
    },
    {
      topic: "Paying extra",
      q: t`With \$200 a month extra on the same loan, how many payments does it take?`,
      a: t`Running the balance forward, \(B \mapsto 1.005B - 1698.88\), it reaches zero at the 267th payment.`,
      code: `finance.loan({ principal: 250000, rate: "6%", periods: 360, extra: 200 }).periods`,
      expect: "267",
    },
    {
      topic: "Net present value",
      q: t`A project costs \$1000 now and returns \$300, \$400 and \$500 at the ends of the next three years. Find its NPV at 10%.`,
      a: t`\(-1000 + \frac{300}{1.1} + \frac{400}{1.1^2} + \frac{500}{1.1^3} \approx -\$21.04\): not worth it at 10%.`,
      code: `finance.npv("10%", [-1000, 300, 400, 500])`,
      check: near(-21.03681442524436, 1e-9),
    },
    {
      topic: "Internal rate of return",
      q: t`Find the internal rate of return of the same project.`,
      a: t`The root of \(-1000 + 300v + 400v^2 + 500v^3 = 0\) with \(v = 1/(1 + i)\): \(i \approx 8.8963\%\).`,
      code: `finance.irr([-1000, 300, 400, 500]).rate`,
      check: near(0.08896339469329154, 1e-9),
    },
    {
      topic: "Bond price",
      q: t`A 10-year bond with face 100 pays a 5% coupon semi-annually. Price it at a yield of 6% (compounded semi-annually).`,
      a: t`\(2.5\,a_{\overline{20}|3\%} + 100 \cdot 1.03^{-20} \approx 92.5613\).`,
      code: `finance.bond({ face: 100, coupon: "5%", frequency: 2, periods: 20 }).price("6%").clean`,
      check: near(92.56126256977221, 1e-9),
    },
    {
      topic: "Yield at par",
      q: t`At what yield does the same bond sell at par?`,
      a: t`At par the yield equals the coupon rate: 5%.`,
      code: `finance.bond({ face: 100, coupon: "5%", frequency: 2, periods: 20 }).yield(100)`,
      expect: "1/20",
    },
    {
      topic: "Duration",
      q: t`Find the Macaulay and modified durations of the bond at a 6% yield.`,
      a: t`Macaulay \(= \sum t\,v^t c_t / P \approx 7.8950\) years; modified \(= 7.8950/1.03 \approx 7.6650\).`,
      code: `const d = finance.bond({ face: 100, coupon: "5%", frequency: 2, periods: 20 }).duration("6%");
[d.macaulay, d.modified]`,
      check: near([7.894997340182342, 7.665045961342079], 1e-9),
    },
    {
      topic: "Forward rates",
      q: t`The one-year spot rate is 4% and the two-year spot rate is 5%. Find the one-year forward rate a year from now.`,
      a: t`\((1.05)^2/1.04 - 1 = \tfrac{25}{416} \approx 6.0096\%\).`,
      code: `finance.yieldCurve({ spots: ["4%", "5%"] }).forward(1, 2)`,
      expect: "25/416",
    },
    {
      topic: "Black–Scholes",
      q: t`Price a one-year European call with \(S = K = 100\), \(r = 5\%\), \(\sigma = 20\%\).`,
      a: t`\(d_1 = 0.35\), \(d_2 = 0.15\); \(C = 100N(0.35) - 100e^{-0.05}N(0.15) \approx 10.4506\).`,
      code: `finance.blackScholes({ spot: 100, strike: 100, rate: "5%", volatility: "20%", time: 1 }).call`,
      check: near(10.450583572185565, 1e-9),
    },
    {
      topic: "Put–call parity",
      q: t`Use put–call parity to price the matching put.`,
      a: t`\(P = C - S + Ke^{-rT} = 10.450584 - 100 + 95.122942 \approx 5.5735\).`,
      code: `const v = finance.blackScholes({ spot: 100, strike: 100, rate: "5%", volatility: "20%", time: 1 });
let viaParity;
try { viaParity = finance.parity({ call: v.call, spot: 100, strike: 100, rate: "5%", time: 1 }); }
catch (e) { viaParity = e.message.slice(0, 40) + "…"; }
PRINT("parity with the Black–Scholes call:", String(viaParity));
v.put`,
      check: near(5.573526022256971, 1e-9),
      status: "partial",
      note: "<code>parity</code> wants exact amounts, so it refuses the enclosed call that <code>blackScholes</code> itself returns (“cannot read … as an exact amount”). The put printed here comes from <code>blackScholes</code> directly. Fix: let <code>parity</code> accept intervals and return an enclosure.",
    },
    {
      topic: "American put on a tree",
      q: t`A stock at 50 moves up by 1.2 or down by 0.8 each step; one step grows money by 1.05. Price a two-step American put struck at 52.`,
      a: t`\(p = (1.05 - 0.8)/0.4 = 0.625\). Final puts 0, 4, 20. At 60: hold \(1.5/1.05 = 1.4286\). At 40: hold 9.52 but exercise 12. Root: hold \((0.625 \cdot 1.4286 + 0.375 \cdot 12)/1.05 = \tfrac{755}{147} \approx 5.1361\), better than exercising (2).`,
      code: `finance.binomialTree({ spot: 50, strike: 52, steps: 2, up: "6/5", down: "4/5", growth: "21/20", type: "put", style: "american" }).price`,
      expect: "755/147",
    },
    {
      topic: "Option strategies",
      q: t`A straddle buys a call (premium 5) and a put (premium 4), both struck at 100. Where does it break even?`,
      a: t`It costs 9, so it breaks even when the stock is \(9\) away from 100: at 91 and 109.`,
      code: `finance.strategy([{ type: "call", strike: 100, premium: 5 }, { type: "put", strike: 100, premium: 4 }]).breakEvens`,
      expect: "[91, 109]",
    },
    {
      topic: "Depreciation",
      q: t`A machine costs \$10{,}000, lasts 5 years and is sold for \$1000. Find the yearly straight-line depreciation and the first year's double-declining-balance depreciation.`,
      a: t`Straight line: \(9000/5 = \$1800\). Double declining: \(2/5\) of \$10{,}000 \(= \$4000\).`,
      code: `const s = finance.depreciation({ cost: 10000, salvage: 1000, life: 5 });
const d = finance.depreciation({ cost: 10000, salvage: 1000, life: 5, method: "declining-balance" });
[s[0].depreciation, d[0].depreciation]`,
      expect: "[1800, 4000]",
    },
    {
      topic: "Life expectancy",
      q: t`Under de Moivre's law with limiting age 100, what is the complete life expectancy at age 40?`,
      a: t`The future lifetime is uniform on \((0, 60)\), so \(\mathring e_{40} = 30\).`,
      code: `finance.deMoivre(100).completeExpectation(40)`,
      expect: "30",
    },
  ],
};
