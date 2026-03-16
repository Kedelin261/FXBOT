package com.kenneth.fxbot.strategy.naked;

public class NakedStrategyParams {

    // How close two highs/lows must be to count as "equal"
    private final double equalLevelTolerance;

    // Minimum sweep distance beyond the equal highs/lows
    private final double minSweepDistance;

    // Require reclaim close back through the liquidity line
    private final boolean requireReclaimClose;

    // Bars to scan backward for liquidity pools
    private final int lookbackBars;

    // Minimum bars between the two highs/lows
    private final int minBarsBetweenTouches;

    // Maximum bars between the two highs/lows
    private final int maxBarsBetweenTouches;

    // Require that the level stayed untapped before the sweep
    private final boolean requireUntapped;

    // Default constructor (safe starter values)
    public NakedStrategyParams() {
        this(
                0.0003,   // equalLevelTolerance
                0.0002,   // minSweepDistance
                true,     // requireReclaimClose
                60,       // lookbackBars
                2,        // minBarsBetweenTouches
                20,       // maxBarsBetweenTouches
                true      // requireUntapped
        );
    }

    public NakedStrategyParams(
            double equalLevelTolerance,
            double minSweepDistance,
            boolean requireReclaimClose,
            int lookbackBars,
            int minBarsBetweenTouches,
            int maxBarsBetweenTouches,
            boolean requireUntapped
    ) {
        this.equalLevelTolerance = equalLevelTolerance;
        this.minSweepDistance = minSweepDistance;
        this.requireReclaimClose = requireReclaimClose;
        this.lookbackBars = lookbackBars;
        this.minBarsBetweenTouches = minBarsBetweenTouches;
        this.maxBarsBetweenTouches = maxBarsBetweenTouches;
        this.requireUntapped = requireUntapped;
    }

    public double getEqualLevelTolerance() {
        return equalLevelTolerance;
    }

    public double getMinSweepDistance() {
        return minSweepDistance;
    }

    public boolean isRequireReclaimClose() {
        return requireReclaimClose;
    }

    public int getLookbackBars() {
        return lookbackBars;
    }

    public int getMinBarsBetweenTouches() {
        return minBarsBetweenTouches;
    }

    public int getMaxBarsBetweenTouches() {
        return maxBarsBetweenTouches;
    }

    public boolean isRequireUntapped() {
        return requireUntapped;
    }
}