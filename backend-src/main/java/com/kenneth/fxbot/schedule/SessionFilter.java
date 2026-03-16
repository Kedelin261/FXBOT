package com.kenneth.fxbot.schedule;

import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

/**
 * Converts an Instant into market-local time and checks if it's allowed
 * based on configured sessions (or ALL).
 */
public class SessionFilter {

    private final ZoneId marketZone;
    private final List<TradingSession> sessions;

    public SessionFilter(ZoneId marketZone, List<TradingSession> sessions) {
        this.marketZone = marketZone != null ? marketZone : ZoneId.of("UTC");
        this.sessions = sessions; // can be null/empty => allow all
    }

    // Some of your code calls allow(...)
    public boolean allow(Instant t) {
        return isAllowed(t);
    }

    // Some of your code calls isAllowed(...)
    public boolean isAllowed(Instant t) {
        if (t == null) return true;

        // If no sessions configured, do not block anything
        if (sessions == null || sessions.isEmpty()) return true;

        // If sessions contains ALL, do not block anything
        for (TradingSession s : sessions) {
            if (s == null) continue;
            if (s == TradingSession.ALL) return true;
            if ("ALL".equalsIgnoreCase(s.name())) return true;
        }

        LocalTime local = t.atZone(marketZone).toLocalTime();

        // Allowed if inside ANY configured session
        for (TradingSession s : sessions) {
            if (s == null) continue;
            if (s.contains(local)) return true;
        }

        return false;
    }
}