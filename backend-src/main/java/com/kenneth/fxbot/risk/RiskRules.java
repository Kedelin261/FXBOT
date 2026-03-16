package com.kenneth.fxbot.risk;

/**
 * Risk configuration used by DailyRiskGovernor.
 * Values are expressed in USD unless otherwise noted.
 */
public class RiskRules {

    /** Maximum loss allowed per trade */
    public double maxLossPerTradeUsd;

    /** Maximum total loss allowed per day */
    public double maxDailyLossUsd;

    /** Maximum total profit allowed per day (stop trading if reached) */
    public double maxDailyProfitUsd;

    /** Maximum number of trades allowed per day */
    public double maxTradesPerDay;

    /** Maximum number of simultaneously open trades */
    public int maxOpenTrades;

    /** Risk multiple (R:R target etc) */
    public double riskRewardRatio;

    /**
     * Full constructor used by other classes
     */
    public RiskRules(
            double maxLossPerTradeUsd,
            double maxDailyLossUsd,
            double maxDailyProfitUsd,
            double maxTradesPerDay,
            int maxOpenTrades,
            double riskRewardRatio
    ) {
        this.maxLossPerTradeUsd = maxLossPerTradeUsd;
        this.maxDailyLossUsd = maxDailyLossUsd;
        this.maxDailyProfitUsd = maxDailyProfitUsd;
        this.maxTradesPerDay = maxTradesPerDay;
        this.maxOpenTrades = maxOpenTrades;
        this.riskRewardRatio = riskRewardRatio;
    }

    /**
     * Default constructor so BotConfig can safely call new RiskRules()
     */
    public RiskRules() {
        this(
                50.0,   // max loss per trade
                200.0,  // max daily loss
                500.0,  // max daily profit
                10,     // max trades per day
                2,      // max open trades
                2.0     // risk reward ratio
        );
    }
}