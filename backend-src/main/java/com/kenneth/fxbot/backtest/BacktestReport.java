package com.kenneth.fxbot.backtest;

import com.kenneth.fxbot.domain.Trade;

import java.util.List;

public record BacktestReport(
        double totalPnLUsd,
        int totalTrades,
        int wins,
        int losses,
        double winRate,
        double maxDrawdownUsd,
        List<Trade> trades,
        int signalsFound,
        int tradesOpened,
        int stopsHit,
        int tpsHit,
        int blockedBySession,
        int blockedByRisk
) {}