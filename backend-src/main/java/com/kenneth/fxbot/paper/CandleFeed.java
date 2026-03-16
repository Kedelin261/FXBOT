package com.kenneth.fxbot.paper;

import com.kenneth.fxbot.domain.Candle;

import java.util.List;

public class CandleFeed {

    private final List<Candle> candles;
    private int idx = 0;

    public CandleFeed(List<Candle> candles) {
        this.candles = candles;
    }

    public Candle next() {
        if (candles == null) return null;
        if (idx >= candles.size()) return null;
        return candles.get(idx++);
    }

    public int remaining() {
        return (candles == null) ? 0 : Math.max(0, candles.size() - idx);
    }
}