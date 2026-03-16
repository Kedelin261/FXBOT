package com.kenneth.fxbot.config;

import com.kenneth.fxbot.risk.RiskRules;
import com.kenneth.fxbot.schedule.TradingSession;

import java.time.ZoneId;
import java.util.List;

public class BotConfig {

    // Keep your default zone
    public ZoneId marketZone = ZoneId.of("UTC");

    // Trading sessions used by SessionFilter
    public List<TradingSession> sessions = List.of(
            // Sydney
            TradingSession.of("SYDNEY", 21, 0, 6, 0),
            // Tokyo
            TradingSession.of("TOKYO", 0, 0, 9, 0),
            // London
            TradingSession.of("LONDON", 7, 0, 16, 0),
            // New York
            TradingSession.of("NEW_YORK", 13, 0, 22, 0)
    );

    // --- Strategy tuning defaults ---
    public int consecutiveCandles = 3;
    public double minBodyPips = 2.0;

    // --- Risk rules ---
    public RiskRules riskRules = new RiskRules(
            50.0,   // max loss per trade
            200.0,  // max daily loss
            500.0,  // max daily profit
            10,     // max trades per day
            2,      // max open trades
            2.0     // risk reward ratio
    );
}