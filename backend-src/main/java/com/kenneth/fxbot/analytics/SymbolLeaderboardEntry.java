package com.kenneth.fxbot.analytics;

public class SymbolLeaderboardEntry {

    public final String symbol;
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

    public SymbolLeaderboardEntry(
            String symbol,
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
        this.symbol = symbol;
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