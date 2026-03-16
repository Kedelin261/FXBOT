package com.kenneth.fxbot.strategy.naked;

import com.kenneth.fxbot.domain.Candle;
import com.kenneth.fxbot.domain.Direction;

public class SweepDetector {

    public static class SweepSignal {
        private final Direction direction;
        private final double liquidityLevel;

        public SweepSignal(Direction direction, double liquidityLevel) {
            this.direction = direction;
            this.liquidityLevel = liquidityLevel;
        }

        public Direction getDirection() {
            return direction;
        }

        public double getLiquidityLevel() {
            return liquidityLevel;
        }
    }

    public SweepSignal detectSweep(
            Candle candle,
            LiquidityPoolDetector.LiquidityPool pool,
            NakedStrategyParams params
    ) {
        if (candle == null || pool == null) return null;

        if (pool.getType() == LiquidityPoolDetector.PoolType.EQUAL_LOWS) {
            // Buy setup:
            // price sweeps below equal lows, then closes back above liquidity line
            boolean swept = candle.low() < (pool.getLevel() - params.getMinSweepDistance());
            boolean reclaimed = candle.close() > pool.getLevel();

            if (swept && (!params.isRequireReclaimClose() || reclaimed)) {
                return new SweepSignal(Direction.BUY, pool.getLevel());
            }
        }

        if (pool.getType() == LiquidityPoolDetector.PoolType.EQUAL_HIGHS) {
            // Sell setup:
            // price sweeps above equal highs, then closes back below liquidity line
            boolean swept = candle.high() > (pool.getLevel() + params.getMinSweepDistance());
            boolean reclaimed = candle.close() < pool.getLevel();

            if (swept && (!params.isRequireReclaimClose() || reclaimed)) {
                return new SweepSignal(Direction.SELL, pool.getLevel());
            }
        }

        return null;
    }
}