package com.kenneth.fxbot.marketdata.live;

import com.kenneth.fxbot.domain.Candle;

public interface CandleFeed {
    void start();
    void stop();
    boolean isRunning();
    Candle pollNext(); // returns next candle, or null if none available right now
}