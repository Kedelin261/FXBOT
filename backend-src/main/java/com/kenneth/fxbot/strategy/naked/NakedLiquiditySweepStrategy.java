package com.kenneth.fxbot.strategy.naked;

import com.kenneth.fxbot.domain.Candle;
import com.kenneth.fxbot.domain.Direction;
import com.kenneth.fxbot.strategy.Strategy;
import com.kenneth.fxbot.strategy.StrategyDecision;

import java.util.List;

public class NakedLiquiditySweepStrategy implements Strategy {

    private final NakedStrategyParams params;
    private final LiquidityPoolDetector liquidityPoolDetector;
    private final SweepDetector sweepDetector;

    public NakedLiquiditySweepStrategy() {
        this(new NakedStrategyParams());
    }

    public NakedLiquiditySweepStrategy(NakedStrategyParams params) {
        this.params = params;
        this.liquidityPoolDetector = new LiquidityPoolDetector();
        this.sweepDetector = new SweepDetector();
    }

    @Override
    public Direction evaluate(List<Candle> candles, int i) {
        return signal(candles, i);
    }

    @Override
    public StrategyDecision explain(List<Candle> candles, int i) {
        if (candles == null || candles.size() < 5 || i < 2 || i >= candles.size()) {
            return new StrategyDecision(
                    getClass().getSimpleName(),
                    Direction.NONE,
                    false,
                    "Not enough candle history to evaluate naked liquidity sweep."
            );
        }

        Candle current = candles.get(i);

        LiquidityPoolDetector.LiquidityPool equalLows =
                liquidityPoolDetector.findEqualLows(candles, i, params);

        SweepDetector.SweepSignal buySweep =
                sweepDetector.detectSweep(current, equalLows, params);

        if (buySweep != null && buySweep.getDirection() == Direction.BUY) {
            return new StrategyDecision(
                    getClass().getSimpleName(),
                    Direction.BUY,
                    true,
                    "BUY triggered: equal lows found and sell-side liquidity sweep detected."
            );
        }

        LiquidityPoolDetector.LiquidityPool equalHighs =
                liquidityPoolDetector.findEqualHighs(candles, i, params);

        SweepDetector.SweepSignal sellSweep =
                sweepDetector.detectSweep(current, equalHighs, params);

        if (sellSweep != null && sellSweep.getDirection() == Direction.SELL) {
            return new StrategyDecision(
                    getClass().getSimpleName(),
                    Direction.SELL,
                    true,
                    "SELL triggered: equal highs found and buy-side liquidity sweep detected."
            );
        }

        if (equalLows == null && equalHighs == null) {
            return new StrategyDecision(
                    getClass().getSimpleName(),
                    Direction.NONE,
                    false,
                    "No valid equal highs or equal lows found."
            );
        }

        if (equalLows != null) {
            return new StrategyDecision(
                    getClass().getSimpleName(),
                    Direction.NONE,
                    false,
                    "Equal lows found, but no valid reclaiming liquidity sweep triggered a BUY."
            );
        }

        return new StrategyDecision(
                getClass().getSimpleName(),
                Direction.NONE,
                false,
                "Equal highs found, but no valid reclaiming liquidity sweep triggered a SELL."
        );
    }

    public Direction signal(List<Candle> candles, int i) {
        if (candles == null || candles.size() < 5 || i < 2 || i >= candles.size()) {
            return Direction.NONE;
        }

        Candle current = candles.get(i);

        LiquidityPoolDetector.LiquidityPool equalLows =
                liquidityPoolDetector.findEqualLows(candles, i, params);

        SweepDetector.SweepSignal buySweep =
                sweepDetector.detectSweep(current, equalLows, params);

        if (buySweep != null && buySweep.getDirection() == Direction.BUY) {
            return Direction.BUY;
        }

        LiquidityPoolDetector.LiquidityPool equalHighs =
                liquidityPoolDetector.findEqualHighs(candles, i, params);

        SweepDetector.SweepSignal sellSweep =
                sweepDetector.detectSweep(current, equalHighs, params);

        if (sellSweep != null && sellSweep.getDirection() == Direction.SELL) {
            return Direction.SELL;
        }

        return Direction.NONE;
    }

    public NakedStrategyParams getParams() {
        return params;
    }
}