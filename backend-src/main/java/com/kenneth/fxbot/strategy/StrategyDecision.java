package com.kenneth.fxbot.strategy;

import com.kenneth.fxbot.domain.Direction;

public class StrategyDecision {

    private final String strategyName;
    private final Direction direction;
    private final boolean triggered;
    private final String reason;

    public StrategyDecision(
            String strategyName,
            Direction direction,
            boolean triggered,
            String reason
    ) {
        this.strategyName = strategyName;
        this.direction = direction;
        this.triggered = triggered;
        this.reason = reason;
    }

    public String getStrategyName() {
        return strategyName;
    }

    public Direction getDirection() {
        return direction;
    }

    public boolean isTriggered() {
        return triggered;
    }

    public String getReason() {
        return reason;
    }
}