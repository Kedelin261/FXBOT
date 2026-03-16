package com.kenneth.fxbot.backtest;

import com.kenneth.fxbot.domain.Trade;

import java.util.List;

public class BacktestStats {

    public record Metrics(
            double avgWinUsd,
            double avgLossUsd,
            double profitFactor,
            double expectancyUsd,
            int maxWinStreak,
            int maxLossStreak
    ) {}

    public static Metrics compute(List<Trade> trades) {
        if (trades == null || trades.isEmpty()) {
            return new Metrics(0.0, 0.0, 0.0, 0.0, 0, 0);
        }

        double sumWins = 0.0;
        int winCount = 0;

        double sumLossAbs = 0.0; // absolute value of losses
        int lossCount = 0;

        int winStreak = 0;
        int lossStreak = 0;
        int maxWinStreak = 0;
        int maxLossStreak = 0;

        for (Trade t : trades) {
            double pnl = t.pnlUsd();

            if (pnl > 0) {
                sumWins += pnl;
                winCount++;

                winStreak++;
                lossStreak = 0;
                maxWinStreak = Math.max(maxWinStreak, winStreak);
            } else if (pnl < 0) {
                sumLossAbs += Math.abs(pnl);
                lossCount++;

                lossStreak++;
                winStreak = 0;
                maxLossStreak = Math.max(maxLossStreak, lossStreak);
            } else {
                // pnl == 0: treat as streak breaker (neutral)
                winStreak = 0;
                lossStreak = 0;
            }
        }

        double avgWin = winCount == 0 ? 0.0 : sumWins / winCount;
        double avgLoss = lossCount == 0 ? 0.0 : -(sumLossAbs / lossCount); // negative average loss
        double profitFactor = sumLossAbs == 0.0 ? (sumWins > 0.0 ? Double.POSITIVE_INFINITY : 0.0) : (sumWins / sumLossAbs);

        // Expectancy per trade = total pnl / trades
        double expectancy = trades.isEmpty() ? 0.0 : trades.stream().mapToDouble(Trade::pnlUsd).sum() / trades.size();

        return new Metrics(avgWin, avgLoss, profitFactor, expectancy, maxWinStreak, maxLossStreak);
    }
}