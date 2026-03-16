package com.kenneth.fxbot.strategy;

import com.kenneth.fxbot.domain.Candle;
import com.kenneth.fxbot.domain.Direction;

import java.util.List;

public class ThreeCandleMomentumStrategy implements Strategy {

    private final double minBodyPips;

    public ThreeCandleMomentumStrategy(double minBodyPips) {
        this.minBodyPips = minBodyPips;
    }

    @Override
    public Direction signal(List<Candle> candles, int i) {
        return evaluate(candles, i);
    }

    @Override
    public Direction evaluate(List<Candle> candles, int i) {
        if (candles == null || i < 3 || i >= candles.size()) return Direction.NONE;

        Candle c1 = candles.get(i - 3);
        Candle c2 = candles.get(i - 2);
        Candle c3 = candles.get(i - 1);

        if (isBullishMomentum(c1) && isBullishMomentum(c2) && isBullishMomentum(c3)) {
            return Direction.BUY;
        }

        return Direction.NONE;
    }

    @Override
    public StrategyDecision explain(List<Candle> candles, int i) {
        if (candles == null || i < 3 || i >= candles.size()) {
            return new StrategyDecision(
                    getClass().getSimpleName(),
                    Direction.NONE,
                    false,
                    "Not enough candle history to evaluate three-candle momentum."
            );
        }

        Candle c1 = candles.get(i - 3);
        Candle c2 = candles.get(i - 2);
        Candle c3 = candles.get(i - 1);

        boolean m1 = isBullishMomentum(c1);
        boolean m2 = isBullishMomentum(c2);
        boolean m3 = isBullishMomentum(c3);

        if (m1 && m2 && m3) {
            return new StrategyDecision(
                    getClass().getSimpleName(),
                    Direction.BUY,
                    true,
                    "BUY triggered: the previous three candles all met bullish momentum requirements."
            );
        }

        return new StrategyDecision(
                getClass().getSimpleName(),
                Direction.NONE,
                false,
                "No signal: the previous three candles did not all meet bullish momentum requirements."
        );
    }

    private boolean isBullishMomentum(Candle c) {
        double body = Math.abs(c.close() - c.open());
        double pips = body * 10000; // wire-phase assumption (major FX pairs)
        return c.close() > c.open() && pips >= minBodyPips;
    }
}