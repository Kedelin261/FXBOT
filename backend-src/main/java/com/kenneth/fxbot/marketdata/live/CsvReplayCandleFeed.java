package com.kenneth.fxbot.marketdata.live;

import com.kenneth.fxbot.domain.Candle;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

public class CsvReplayCandleFeed implements CandleFeed {

    private final List<Candle> candles;
    private final long millisPerCandle;

    private int idx = 0;
    private long nextEmitAtMs = 0;
    private final AtomicBoolean running = new AtomicBoolean(false);

    public CsvReplayCandleFeed(List<Candle> candles, long millisPerCandle) {
        this.candles = candles;
        this.millisPerCandle = millisPerCandle;
    }

    @Override
    public void start() {
        if (candles == null || candles.isEmpty()) return;
        running.set(true);
        nextEmitAtMs = System.currentTimeMillis();
    }

    @Override
    public void stop() {
        running.set(false);
    }

    @Override
    public boolean isRunning() {
        return running.get();
    }

    @Override
    public Candle pollNext() {
        if (!running.get()) return null;
        if (idx >= candles.size()) {
            running.set(false);
            return null;
        }

        long now = System.currentTimeMillis();
        if (now < nextEmitAtMs) return null;

        Candle out = candles.get(idx++);
        nextEmitAtMs = now + millisPerCandle;
        return out;
    }
}