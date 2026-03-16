package com.kenneth.fxbot.schedule;

import java.time.LocalTime;
import java.util.Objects;

/**
 * Represents a daily trading window in MARKET LOCAL TIME (SessionFilter converts Instant -> LocalTime).
 * Supports sessions that cross midnight (example: 21:00 -> 06:00).
 */
public class TradingSession {

    private final String name;
    private final LocalTime start;
    private final LocalTime end;

    /** Special session meaning "no session filtering" */
    public static final TradingSession ALL =
            new TradingSession("ALL", LocalTime.MIDNIGHT, LocalTime.of(23, 59, 59));

    public TradingSession(String name, LocalTime start, LocalTime end) {
        this.name = Objects.requireNonNullElse(name, "SESSION");
        this.start = Objects.requireNonNull(start, "start");
        this.end = Objects.requireNonNull(end, "end");
    }

    /**
     * Factory used by your BotConfig:
     * TradingSession.of("LONDON", 7, 0, 16, 0)
     */
    public static TradingSession of(String name, int startHour, int startMin, int endHour, int endMin) {
        return new TradingSession(name, LocalTime.of(startHour, startMin), LocalTime.of(endHour, endMin));
    }

    public String name() {
        return name;
    }

    public LocalTime start() {
        return start;
    }

    public LocalTime end() {
        return end;
    }

    /**
     * True if the given local time falls inside this session.
     * Handles sessions that do NOT cross midnight (start <= end)
     * and sessions that DO cross midnight (start > end).
     */
    public boolean contains(LocalTime t) {
        if (t == null) return false;

        // Normal session: 07:00 -> 16:00
        if (!crossesMidnight()) {
            return !t.isBefore(start) && !t.isAfter(end);
        }

        // Cross-midnight session: 21:00 -> 06:00
        // Valid if time >= start OR time <= end
        return !t.isBefore(start) || !t.isAfter(end);
    }

    public boolean crossesMidnight() {
        return start.isAfter(end);
    }

    @Override
    public String toString() {
        return name + "(" + start + "->" + end + ")";
    }
}