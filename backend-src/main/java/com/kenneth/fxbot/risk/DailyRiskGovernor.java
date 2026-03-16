package com.kenneth.fxbot.risk;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Central risk gate used by the engine.
 * Keeps track of open trades, trades today, and realized PnL today.
 */
public class DailyRiskGovernor {

    private final RiskRules rules;
    private final ZoneId marketZone;

    // --- state ---
    private int openTrades = 0;
    private int tradesToday = 0;
    private double realizedPnlTodayUsd = 0.0;
    private LocalDate currentDay;

    // --- debug counters ---
    public long blockedByOpenTradesLimit = 0;
    public long blockedByTradesPerDayLimit = 0;
    public long blockedByDailyLossLimit = 0;
    public long blockedByDailyProfitTarget = 0;

    public DailyRiskGovernor(RiskRules rules, ZoneId marketZone) {
        this.rules = rules == null ? new RiskRules() : rules;
        this.marketZone = marketZone == null ? ZoneId.of("UTC") : marketZone;
        this.currentDay = LocalDate.now(this.marketZone);
    }

    /**
     * Call on every tick so the governor resets when the day changes.
     */
    public void onTick(Instant now) {
        if (now == null) return;

        LocalDate day = now.atZone(marketZone).toLocalDate();
        if (!day.equals(currentDay)) {
            currentDay = day;
            tradesToday = 0;
            realizedPnlTodayUsd = 0.0;
            openTrades = 0;
        }
    }

    /**
     * Main gate: can we open a NEW trade right now?
     */
    public boolean canOpenNewTrade() {

        // 1) Open trades limit
        if (rules.maxOpenTrades > 0 && openTrades >= rules.maxOpenTrades) {
            blockedByOpenTradesLimit++;
            return false;
        }

        // 2) Trades per day limit
        int maxTrades = (int) Math.floor(rules.maxTradesPerDay);
        if (maxTrades > 0 && tradesToday >= maxTrades) {
            blockedByTradesPerDayLimit++;
            return false;
        }

        // 3) Daily loss limit
        if (rules.maxDailyLossUsd > 0 && realizedPnlTodayUsd <= -rules.maxDailyLossUsd) {
            blockedByDailyLossLimit++;
            return false;
        }

        // 4) Daily profit target
        if (rules.maxDailyProfitUsd > 0 && realizedPnlTodayUsd >= rules.maxDailyProfitUsd) {
            blockedByDailyProfitTarget++;
            return false;
        }

        return true;
    }

    // --- Trade lifecycle hooks ---

    public void onTradeOpened() {
        openTrades++;
        tradesToday++;
    }

    public void onTradeClosed(double realizedPnlUsd) {
        if (openTrades > 0) {
            openTrades--;
        }
        realizedPnlTodayUsd += realizedPnlUsd;
    }

    // --- Values used by engine / services ---

    public int getOpenTrades() {
        return openTrades;
    }

    public int getTradesToday() {
        return tradesToday;
    }

    public double getRealizedPnlTodayUsd() {
        return realizedPnlTodayUsd;
    }

    public double riskPerTradeUsd() {
        return rules.maxLossPerTradeUsd;
    }

    public double maxLossPerTradeUsd() {
        return rules.maxLossPerTradeUsd;
    }

    public int maxOpenTrades() {
        return rules.maxOpenTrades;
    }

    public RiskRules rules() {
        return rules;
    }
}