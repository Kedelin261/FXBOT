package com.kenneth.fxbot.analytics;

public class StrategyLeaderboardEntry {

    public final String strategyName;
    public final int totalTrades;
    public final int wins;
    public final int losses;
    public final double winRate;
    public final double totalPnlUsd;
    public final double averageWinUsd;
    public final double averageLossUsd;
    public final double profitFactor;
    public final double maxDrawdownUsd;
    public final double score;

    public StrategyLeaderboardEntry(
            String strategyName,
            int totalTrades,
            int wins,
            int losses,
            double winRate,
            double totalPnlUsd,
            double averageWinUsd,
            double averageLossUsd,
            double profitFactor,
            double maxDrawdownUsd,
            double score
    ) {
        this.strategyName = strategyName;
        this.totalTrades = totalTrades;
        this.wins = wins;
        this.losses = losses;
        this.winRate = winRate;
        this.totalPnlUsd = totalPnlUsd;
        this.averageWinUsd = averageWinUsd;
        this.averageLossUsd = averageLossUsd;
        this.profitFactor = profitFactor;
        this.maxDrawdownUsd = maxDrawdownUsd;
        this.score = score;
    }
}