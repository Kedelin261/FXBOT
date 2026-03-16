package com.kenneth.fxbot.backtest;

import com.kenneth.fxbot.domain.*;
import com.kenneth.fxbot.risk.DailyRiskGovernor;
import com.kenneth.fxbot.schedule.SessionFilter;
import com.kenneth.fxbot.strategy.Strategy;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class BacktestEngine {

    public BacktestReport run(
            Instrument instrument,
            List<Candle> candles,
            Strategy strategy,
            DailyRiskGovernor riskGov,
            SessionFilter sessionFilter
    ) {

        List<Trade> trades = new ArrayList<>();

        int wins = 0;
        int losses = 0;

        int signalsFound = 0;
        int tradesOpened = 0;

        int stopsHit = 0;
        int tpsHit = 0;

        int blockedBySession = 0;
        int blockedByRisk = 0;

        double totalPnLUsd = 0.0;

        double equity = 0.0;
        double peakEquity = 0.0;
        double maxDrawdownUsd = 0.0;

        OpenTrade openTrade = null;

        for (int i = 2; i < candles.size(); i++) {

            Candle c = candles.get(i);
            Instant t = c.time();

            // 1) Exit logic
            if (openTrade != null) {
                Exit exit = checkExit(openTrade, c);

                if (exit != null) {
                    double pnl = exit.pnlUsd;

                    trades.add(new Trade(
                            instrument,
                            openTrade.direction,
                            openTrade.entryTime,
                            openTrade.entryPrice,
                            exit.exitTime,
                            exit.exitPrice,
                            pnl,
                            "BacktestEngine"
                    ));

                    totalPnLUsd += pnl;
                    equity += pnl;

                    if (equity > peakEquity) peakEquity = equity;

                    double dd = peakEquity - equity;
                    if (dd > maxDrawdownUsd) maxDrawdownUsd = dd;

                    if (pnl >= 0) wins++; else losses++;

                    if (exit.type == ExitType.SL) stopsHit++;
                    if (exit.type == ExitType.TP) tpsHit++;

                    openTrade = null;
                }
            }

            // still open? skip entry
            if (openTrade != null) continue;

            // 2) Strategy signal
            Direction signal = strategy.evaluate(candles, i);
            if (signal == null) continue;
            if ("NONE".equalsIgnoreCase(signal.name())) continue;

            signalsFound++;

            // 3) Session gate
            if (!sessionFilter.isAllowed(t)) {
                blockedBySession++;
                continue;
            }

            // 4) Risk gate
            if (!riskGov.canOpenNewTrade()) {
                blockedByRisk++;
                continue;
            }

            // 5) Enter trade
            boolean isLong = isLong(signal);

            double entryPrice = c.open();
            double priceDelta = 0.001; // placeholder delta so it compiles

            double stopPrice = isLong ? entryPrice - priceDelta : entryPrice + priceDelta;
            double tpPrice   = isLong ? entryPrice + priceDelta : entryPrice - priceDelta;

            openTrade = new OpenTrade(signal, t, entryPrice, stopPrice, tpPrice);
            tradesOpened++;
        }

        int totalTrades = wins + losses;
        double winRate = totalTrades == 0 ? 0.0 : (wins * 1.0 / totalTrades);

        return new BacktestReport(
                totalPnLUsd,
                totalTrades,
                wins,
                losses,
                winRate,
                maxDrawdownUsd,
                trades,
                signalsFound,
                tradesOpened,
                stopsHit,
                tpsHit,
                blockedBySession,
                blockedByRisk
        );
    }

    /**
     * IMPORTANT: We do NOT reference Direction.LONG/SHORT here.
     * We infer long/short from enum name so this compiles with your Direction enum.
     * Accepts LONG or BUY as "long". Everything else becomes "short".
     */
    private boolean isLong(Direction d) {
        String n = d.name().toUpperCase();
        return n.equals("LONG") || n.equals("BUY");
    }

    // ---------- INTERNAL MODELS ----------

    private static class OpenTrade {
        Direction direction;
        Instant entryTime;
        double entryPrice;
        double stopPrice;
        double takeProfitPrice;

        OpenTrade(Direction direction, Instant entryTime, double entryPrice, double stopPrice, double takeProfitPrice) {
            this.direction = direction;
            this.entryTime = entryTime;
            this.entryPrice = entryPrice;
            this.stopPrice = stopPrice;
            this.takeProfitPrice = takeProfitPrice;
        }
    }

    private enum ExitType { SL, TP }

    private static class Exit {
        Instant exitTime;
        double exitPrice;
        double pnlUsd;
        ExitType type;

        Exit(Instant exitTime, double exitPrice, double pnlUsd, ExitType type) {
            this.exitTime = exitTime;
            this.exitPrice = exitPrice;
            this.pnlUsd = pnlUsd;
            this.type = type;
        }
    }

    private Exit checkExit(OpenTrade trade, Candle c) {

        boolean isLong = isLong(trade.direction);

        if (isLong) {
            if (c.low() <= trade.stopPrice) {
                return new Exit(c.time(), trade.stopPrice, -1, ExitType.SL);
            }
            if (c.high() >= trade.takeProfitPrice) {
                return new Exit(c.time(), trade.takeProfitPrice, 1, ExitType.TP);
            }
        } else {
            if (c.high() >= trade.stopPrice) {
                return new Exit(c.time(), trade.stopPrice, -1, ExitType.SL);
            }
            if (c.low() <= trade.takeProfitPrice) {
                return new Exit(c.time(), trade.takeProfitPrice, 1, ExitType.TP);
            }
        }

        return null;
    }
}