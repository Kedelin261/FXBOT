package com.kenneth.fxbot.strategy;

import com.kenneth.fxbot.config.BotConfig;
import com.kenneth.fxbot.domain.StrategyType;
import com.kenneth.fxbot.strategy.naked.NakedLiquiditySweepStrategy;
import com.kenneth.fxbot.strategy.naked.NakedStrategyParams;

public class StrategyFactory {

    private StrategyFactory() {
    }

    public static Strategy create(StrategyType type, BotConfig config) {
        if (type == null) {
            throw new IllegalArgumentException("Strategy type is required");
        }

        switch (type) {
            case THREE_CANDLE:
                return new ThreeCandleMomentumStrategy(config.consecutiveCandles);

            case NAKED_LIQUIDITY_SWEEP:
                return new NakedLiquiditySweepStrategy(new NakedStrategyParams());

            default:
                throw new IllegalArgumentException("Unsupported strategy type: " + type);
        }
    }

    public static Strategy create(StrategyType type) {
        if (type == null) {
            throw new IllegalArgumentException("Strategy type is required");
        }

        switch (type) {
            case THREE_CANDLE:
                return new ThreeCandleMomentumStrategy(3.0);

            case NAKED_LIQUIDITY_SWEEP:
                return new NakedLiquiditySweepStrategy(new NakedStrategyParams());

            default:
                throw new IllegalArgumentException("Unsupported strategy type: " + type);
        }
    }

    public static Strategy create(String typeName, BotConfig config) {
        if (typeName == null || typeName.isBlank()) {
            throw new IllegalArgumentException("Strategy name is required");
        }

        StrategyType type = StrategyType.valueOf(typeName.trim().toUpperCase());
        return create(type, config);
    }
}