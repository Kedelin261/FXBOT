package com.kenneth.fxbot.paper;

import com.kenneth.fxbot.domain.Candle;
import com.kenneth.fxbot.domain.Direction;
import com.kenneth.fxbot.domain.Instrument;
import com.kenneth.fxbot.domain.Trade;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class PaperBroker {

    private OpenPaperTrade open;
    private final List<Trade> closed = new ArrayList<>();

    public boolean hasOpenTrade() {
        return open != null;
    }

    public OpenPaperTrade openTrade() {
        return open;
    }

    public List<Trade> closedTrades() {
        return closed;
    }

    public void enter(
            Instrument instrument,
            Direction direction,
            Instant entryTime,
            double entryPrice,
            double stopLossPrice,
            double takeProfitPrice,
            double riskUsd,
            double stopLossPips,
            double takeProfitPips,
            String strategyName,
            double pipSize,
            double contractMultiplier
    ) {
        // 1 at a time for now
        if (open != null) return;

        open = new OpenPaperTrade(
                instrument,
                direction,
                entryTime,
                entryPrice,
                stopLossPrice,
                takeProfitPrice,
                riskUsd,
                stopLossPips,
                takeProfitPips,
                strategyName,
                pipSize,
                contractMultiplier
        );
    }

    public void onCandle(Candle candle) {
        if (open == null || candle == null) return;

        boolean stopHit = false;
        boolean takeProfitHit = false;
        double exitPrice = 0.0;

        if (open.getDirection() == Direction.BUY) {
            if (candle.low() <= open.getStopLossPrice()) {
                stopHit = true;
                exitPrice = open.getStopLossPrice();
            } else if (candle.high() >= open.getTakeProfitPrice()) {
                takeProfitHit = true;
                exitPrice = open.getTakeProfitPrice();
            }
        } else if (open.getDirection() == Direction.SELL) {
            if (candle.high() >= open.getStopLossPrice()) {
                stopHit = true;
                exitPrice = open.getStopLossPrice();
            } else if (candle.low() <= open.getTakeProfitPrice()) {
                takeProfitHit = true;
                exitPrice = open.getTakeProfitPrice();
            }
        }

        if (stopHit || takeProfitHit) {
            closeTrade(candle.time(), exitPrice);
        }
    }

    // force-close an open trade when the replay ends
    public void forceClose(Instant exitTime, double exitPrice) {
        if (open == null) return;
        closeTrade(exitTime, exitPrice);
    }

    private void closeTrade(Instant exitTime, double exitPrice) {
        if (open == null) return;

        double pnlUsd = calculatePnlUsd(exitPrice);

        Trade trade = new Trade(
                open.getInstrument(),
                open.getDirection(),
                open.getEntryTime(),
                open.getEntryPrice(),
                exitTime,
                exitPrice,
                pnlUsd,
                open.getStrategyName()
        );

        closed.add(trade);
        open = null;
    }

    private double calculatePnlUsd(double exitPrice) {
        if (open == null) return 0.0;

        double priceMove;
        if (open.getDirection() == Direction.BUY) {
            priceMove = exitPrice - open.getEntryPrice();
        } else {
            priceMove = open.getEntryPrice() - exitPrice;
        }

        double pipsMoved = priceMove / open.getPipSize();
        double pipValueUsd = pipValueUsd(open.getInstrument(), open.getEntryPrice());

        return pipsMoved * pipValueUsd;
    }

    private double pipValueUsd(Instrument instrument, double entryPrice) {
        String name = instrument.name();

        // Quote currency is USD (EURUSD, GBPUSD, AUDUSD)
        if (name.endsWith("USD")) {
            return open.getContractMultiplier() * open.getPipSize();
        }

        // Base currency is USD (USDJPY, USDCAD, USDCHF)
        if (name.startsWith("USD")) {
            return (open.getContractMultiplier() * open.getPipSize()) / entryPrice;
        }

        // Safe fallback for current FX-only project
        return open.getContractMultiplier() * open.getPipSize();
    }

    /** Wire-phase helper: clears the open trade without creating a closed Trade object. */
    public void clearOpen() {
        open = null;
    }

    /**
     * Minimal representation of an "open" paper trade.
     * Keeps your broker compiling even if you haven't built a full trade-close pipeline yet.
     */
    public static class OpenPaperTrade {
        private final Instrument instrument;
        private final Direction direction;
        private final Instant entryTime;
        private final double entryPrice;
        private final double stopLossPrice;
        private final double takeProfitPrice;
        private final double riskUsd;
        private final double stopLossPips;
        private final double takeProfitPips;
        private final String strategyName;
        private final double pipSize;
        private final double contractMultiplier;

        public OpenPaperTrade(
                Instrument instrument,
                Direction direction,
                Instant entryTime,
                double entryPrice,
                double stopLossPrice,
                double takeProfitPrice,
                double riskUsd,
                double stopLossPips,
                double takeProfitPips,
                String strategyName,
                double pipSize,
                double contractMultiplier
        ) {
            this.instrument = instrument;
            this.direction = direction;
            this.entryTime = entryTime;
            this.entryPrice = entryPrice;
            this.stopLossPrice = stopLossPrice;
            this.takeProfitPrice = takeProfitPrice;
            this.riskUsd = riskUsd;
            this.stopLossPips = stopLossPips;
            this.takeProfitPips = takeProfitPips;
            this.strategyName = strategyName;
            this.pipSize = pipSize;
            this.contractMultiplier = contractMultiplier;
        }

        public Instrument getInstrument() { return instrument; }
        public Direction getDirection() { return direction; }
        public Instant getEntryTime() { return entryTime; }
        public double getEntryPrice() { return entryPrice; }
        public double getStopLossPrice() { return stopLossPrice; }
        public double getTakeProfitPrice() { return takeProfitPrice; }
        public double getRiskUsd() { return riskUsd; }
        public double getStopLossPips() { return stopLossPips; }
        public double getTakeProfitPips() { return takeProfitPips; }
        public String getStrategyName() { return strategyName; }
        public double getPipSize() { return pipSize; }
        public double getContractMultiplier() { return contractMultiplier; }
    }
}