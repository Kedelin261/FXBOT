package com.kenneth.fxbot.analytics;

import com.kenneth.fxbot.domain.Trade;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class PerformanceStats {

    public final int totalTrades;
    public final int wins;
    public final int losses;
    public final double winRate;
    public final double totalPnlUsd;
    public final double averageWinUsd;
    public final double averageLossUsd;
    public final double profitFactor;

    public final double maxDrawdownUsd;
    public final double maxDrawdownPct;

    public PerformanceStats(
            int totalTrades,
            int wins,
            int losses,
            double winRate,
            double totalPnlUsd,
            double averageWinUsd,
            double averageLossUsd,
            double profitFactor,
            double maxDrawdownUsd,
            double maxDrawdownPct
    ) {
        this.totalTrades = totalTrades;
        this.wins = wins;
        this.losses = losses;
        this.winRate = winRate;
        this.totalPnlUsd = totalPnlUsd;
        this.averageWinUsd = averageWinUsd;
        this.averageLossUsd = averageLossUsd;
        this.profitFactor = profitFactor;
        this.maxDrawdownUsd = maxDrawdownUsd;
        this.maxDrawdownPct = maxDrawdownPct;
    }

    public static PerformanceStats fromTrades(List<Trade> trades) {
        if (trades == null || trades.isEmpty()) {
            return new PerformanceStats(
                    0, 0, 0,
                    0.0, 0.0, 0.0, 0.0, 0.0,
                    0.0, 0.0
            );
        }

        int totalTrades = trades.size();
        int wins = 0;
        int losses = 0;

        double totalPnlUsd = 0.0;
        double grossProfit = 0.0;
        double grossLossAbs = 0.0;
        double totalWinsUsd = 0.0;
        double totalLossesUsdAbs = 0.0;

        double equity = 0.0;
        double peakEquity = 0.0;
        double maxDrawdownUsd = 0.0;
        double maxDrawdownPct = 0.0;

        for (Trade trade : trades) {
            double pnl = trade.pnlUsd();

            totalPnlUsd += pnl;

            if (pnl > 0) {
                wins++;
                grossProfit += pnl;
                totalWinsUsd += pnl;
            } else if (pnl < 0) {
                losses++;
                grossLossAbs += Math.abs(pnl);
                totalLossesUsdAbs += Math.abs(pnl);
            }

            equity += pnl;

            if (equity > peakEquity) {
                peakEquity = equity;
            }

            double currentDrawdownUsd = peakEquity - equity;
            if (currentDrawdownUsd > maxDrawdownUsd) {
                maxDrawdownUsd = currentDrawdownUsd;
            }

            double currentDrawdownPct = peakEquity == 0.0
                    ? 0.0
                    : (currentDrawdownUsd / peakEquity) * 100.0;

            if (currentDrawdownPct > maxDrawdownPct) {
                maxDrawdownPct = currentDrawdownPct;
            }
        }

        double winRate = totalTrades == 0 ? 0.0 : (wins * 100.0) / totalTrades;
        double averageWinUsd = wins == 0 ? 0.0 : totalWinsUsd / wins;
        double averageLossUsd = losses == 0 ? 0.0 : totalLossesUsdAbs / losses;
        double profitFactor = grossLossAbs == 0.0 ? grossProfit : grossProfit / grossLossAbs;

        return new PerformanceStats(
                totalTrades,
                wins,
                losses,
                winRate,
                totalPnlUsd,
                averageWinUsd,
                averageLossUsd,
                profitFactor,
                maxDrawdownUsd,
                maxDrawdownPct
        );
    }

    /*
     * NEW — helper class for equity curve
     */
    public static class EquityPoint {
        public final Instant time;
        public final double equity;

        public EquityPoint(Instant time, double equity) {
            this.time = time;
            this.equity = equity;
        }
    }

    /*
     * NEW — build equity curve from trades
     */
    public static List<EquityPoint> equityCurve(List<Trade> trades) {
        List<EquityPoint> curve = new ArrayList<>();

        if (trades == null || trades.isEmpty()) {
            return curve;
        }

        double equity = 0.0;

        for (Trade trade : trades) {
            equity += trade.pnlUsd();
            curve.add(new EquityPoint(trade.exitTime(), equity));
        }

        return curve;
    }
}