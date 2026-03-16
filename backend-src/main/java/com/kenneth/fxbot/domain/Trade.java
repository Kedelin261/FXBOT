package com.kenneth.fxbot.domain;

import java.time.Instant;

public record Trade(
        Instrument instrument,
        Direction direction,
        Instant entryTime,
        double entryPrice,
        Instant exitTime,
        double exitPrice,
        double pnlUsd,
        String strategyName
) {
    public boolean isWin() {
        return pnlUsd > 0;
    }

    public boolean isLoss() {
        return pnlUsd < 0;
    }
}