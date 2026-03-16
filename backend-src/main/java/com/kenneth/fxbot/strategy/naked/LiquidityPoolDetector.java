package com.kenneth.fxbot.strategy.naked;

import com.kenneth.fxbot.domain.Candle;

import java.util.List;

public class LiquidityPoolDetector {

    public enum PoolType {
        EQUAL_LOWS,
        EQUAL_HIGHS
    }

    public static class LiquidityPool {
        private final PoolType type;
        private final int firstIndex;
        private final int secondIndex;
        private final double level;

        public LiquidityPool(PoolType type, int firstIndex, int secondIndex, double level) {
            this.type = type;
            this.firstIndex = firstIndex;
            this.secondIndex = secondIndex;
            this.level = level;
        }

        public PoolType getType() {
            return type;
        }

        public int getFirstIndex() {
            return firstIndex;
        }

        public int getSecondIndex() {
            return secondIndex;
        }

        public double getLevel() {
            return level;
        }
    }

    public LiquidityPool findEqualLows(List<Candle> candles, int currentIndex, NakedStrategyParams params) {
        if (candles == null || candles.size() < 3 || currentIndex < 2) return null;

        int start = Math.max(0, currentIndex - params.getLookbackBars());

        for (int i = start; i < currentIndex; i++) {
            for (int j = i + params.getMinBarsBetweenTouches(); j < currentIndex; j++) {

                int distance = j - i;
                if (distance > params.getMaxBarsBetweenTouches()) continue;

                double low1 = candles.get(i).low();
                double low2 = candles.get(j).low();

                if (Math.abs(low1 - low2) <= params.getEqualLevelTolerance()) {
                    double level = Math.min(low1, low2);

                    if (params.isRequireUntapped() && !isUntappedEqualLow(candles, j + 1, currentIndex - 1, level, params.getEqualLevelTolerance())) {
                        continue;
                    }

                    return new LiquidityPool(PoolType.EQUAL_LOWS, i, j, level);
                }
            }
        }

        return null;
    }

    public LiquidityPool findEqualHighs(List<Candle> candles, int currentIndex, NakedStrategyParams params) {
        if (candles == null || candles.size() < 3 || currentIndex < 2) return null;

        int start = Math.max(0, currentIndex - params.getLookbackBars());

        for (int i = start; i < currentIndex; i++) {
            for (int j = i + params.getMinBarsBetweenTouches(); j < currentIndex; j++) {

                int distance = j - i;
                if (distance > params.getMaxBarsBetweenTouches()) continue;

                double high1 = candles.get(i).high();
                double high2 = candles.get(j).high();

                if (Math.abs(high1 - high2) <= params.getEqualLevelTolerance()) {
                    double level = Math.max(high1, high2);

                    if (params.isRequireUntapped() && !isUntappedEqualHigh(candles, j + 1, currentIndex - 1, level, params.getEqualLevelTolerance())) {
                        continue;
                    }

                    return new LiquidityPool(PoolType.EQUAL_HIGHS, i, j, level);
                }
            }
        }

        return null;
    }

    private boolean isUntappedEqualLow(List<Candle> candles, int from, int to, double level, double tolerance) {
        if (from > to) return true;

        for (int i = from; i <= to; i++) {
            if (candles.get(i).low() < (level - tolerance)) {
                return false;
            }
        }
        return true;
    }

    private boolean isUntappedEqualHigh(List<Candle> candles, int from, int to, double level, double tolerance) {
        if (from > to) return true;

        for (int i = from; i <= to; i++) {
            if (candles.get(i).high() > (level + tolerance)) {
                return false;
            }
        }
        return true;
    }
}