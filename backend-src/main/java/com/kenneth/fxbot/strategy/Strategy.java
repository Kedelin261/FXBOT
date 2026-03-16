package com.kenneth.fxbot.strategy;

import com.kenneth.fxbot.domain.Candle;
import com.kenneth.fxbot.domain.Direction;

import java.util.List;

public interface Strategy {

    Direction evaluate(List<Candle> candles, int i);

    default Direction signal(List<Candle> candles, int i) {
        return evaluate(candles, i);
    }

    default StrategyDecision explain(List<Candle> candles, int i) {
        Direction direction = evaluate(candles, i);

        if (direction != null && direction != Direction.NONE) {
            return new StrategyDecision(
                    getClass().getSimpleName(),
                    direction,
                    true,
                    "Strategy triggered a signal."
            );
        }

        return new StrategyDecision(
                getClass().getSimpleName(),
                Direction.NONE,
                false,
                "No signal."
        );
    }
}