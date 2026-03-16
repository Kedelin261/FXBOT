package com.kenneth.fxbot.paper;

import com.kenneth.fxbot.config.BotConfig;
import com.kenneth.fxbot.config.InstrumentConfig;
import com.kenneth.fxbot.domain.Candle;
import com.kenneth.fxbot.domain.Direction;
import com.kenneth.fxbot.domain.Instrument;
import com.kenneth.fxbot.domain.InstrumentSpec;
import com.kenneth.fxbot.domain.Trade;
import com.kenneth.fxbot.marketdata.CsvCandleLoader;
import com.kenneth.fxbot.risk.DailyRiskGovernor;
import com.kenneth.fxbot.schedule.SessionFilter;
import com.kenneth.fxbot.strategy.Strategy;
import com.kenneth.fxbot.strategy.StrategyDecision;
import com.kenneth.fxbot.strategy.ThreeCandleMomentumStrategy;
import com.kenneth.fxbot.strategy.naked.NakedLiquiditySweepStrategy;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaperForwardTestService {

    public static class PaperStartRequest {
        public Map<String, String> csvPaths;
        public int millisPerCandle;
    }

    private final BotConfig config = new BotConfig();
    private final InstrumentConfig instrumentConfig = new InstrumentConfig();
    private DailyRiskGovernor riskGov = new DailyRiskGovernor(config.riskRules, config.marketZone);
    private final SessionFilter sessionFilter = new SessionFilter(config.marketZone, config.sessions);
    private final CsvCandleLoader loader = new CsvCandleLoader();

    private final Map<Instrument, CandleFeed> feeds = new LinkedHashMap<>();
    private final Map<Instrument, List<Candle>> history = new LinkedHashMap<>();
    private final Map<Instrument, PaperBroker> brokers = new LinkedHashMap<>();
    private final Map<Instrument, Candle> lastCandles = new LinkedHashMap<>();
    private final Map<Instrument, List<Strategy>> strategies = new LinkedHashMap<>();

    private volatile boolean running = false;
    private volatile long ticks = 0;

    public synchronized Map<String, Object> start(Map<String, String> csvPaths, int millisPerCandle) {
        if (csvPaths == null || csvPaths.isEmpty()) {
            throw new IllegalArgumentException("csvPaths is required");
        }

        feeds.clear();
        history.clear();
        brokers.clear();
        strategies.clear();
        lastCandles.clear();
        ticks = 0;
        running = false;

        riskGov = new DailyRiskGovernor(config.riskRules, config.marketZone);

        for (Map.Entry<String, String> entry : csvPaths.entrySet()) {
            Instrument inst = Instrument.valueOf(entry.getKey().trim().toUpperCase());
            Path p = Path.of(entry.getValue());

            final List<Candle> candles;
            try {
                candles = loader.load(p);
            } catch (Exception e) {
                throw new RuntimeException("Failed to load CSV for " + inst + " at path: " + p, e);
            }

            feeds.put(inst, new CandleFeed(candles));
            history.put(inst, new ArrayList<>(Math.min(5000, candles.size())));
            brokers.put(inst, new PaperBroker());

            List<Strategy> strategyList = new ArrayList<>();
            strategyList.add(new NakedLiquiditySweepStrategy());
            strategyList.add(new ThreeCandleMomentumStrategy(config.consecutiveCandles));
            strategies.put(inst, strategyList);
        }

        running = true;
        System.out.println("[PAPER] START called. feeds=" + feeds.size() + " symbols=" + feeds.keySet());

        return status();
    }

    public synchronized Map<String, Object> start(PaperStartRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("request is required");
        }

        int speed = (req.millisPerCandle <= 0) ? 1000 : req.millisPerCandle;
        return start(req.csvPaths, speed);
    }

    public synchronized Map<String, Object> stop() {
        running = false;
        System.out.println("[PAPER] STOP called.");
        return status();
    }

    public boolean isRunning() {
        return running;
    }

    public void tick() {
        if (!running) return;

        ticks++;

        boolean gotAnyCandle = false;

        for (Map.Entry<Instrument, CandleFeed> feedEntry : feeds.entrySet()) {
            Instrument inst = feedEntry.getKey();
            CandleFeed feed = feedEntry.getValue();

            Candle c = feed.next();
            if (c == null) continue;

            gotAnyCandle = true;
            lastCandles.put(inst, c);

            riskGov.onTick(c.time());

            PaperBroker broker = brokers.get(inst);
            if (broker != null) {
                int closedBefore = broker.closedTrades().size();
                broker.onCandle(c);

                if (broker.closedTrades().size() > closedBefore) {
                    Trade lastClosed = broker.closedTrades().get(broker.closedTrades().size() - 1);
                    riskGov.onTradeClosed(lastClosed.pnlUsd());
                }
            }

            List<Candle> hist = history.get(inst);
            if (hist == null) {
                hist = new ArrayList<>();
                history.put(inst, hist);
            }
            hist.add(c);

            try {
                if (!sessionFilter.isAllowed(c.time())) {
                    continue;
                }
            } catch (Exception ignored) {
            }

            List<Strategy> strategyList = strategies.get(inst);

            if (broker == null || strategyList == null || strategyList.isEmpty()) {
                continue;
            }

            if (!broker.hasOpenTrade() && riskGov.canOpenNewTrade()) {
                Direction signal = Direction.NONE;
                String signalStrategyName = null;

                int i = hist.size() - 1;
                if (i >= 0) {
                    for (Strategy strat : strategyList) {
                        Direction candidate = strat.signal(hist, i);

                        if (candidate != null && candidate != Direction.NONE) {
                            signal = candidate;
                            signalStrategyName = strat.getClass().getSimpleName();
                            System.out.println("[PAPER] SIGNAL " + inst + " " + signal + " strategy=" + signalStrategyName + " tick=" + ticks);
                            break;
                        }
                    }
                }

                if (signal != null && signal != Direction.NONE) {
                    double entry = c.close();

                    InstrumentSpec spec = instrumentConfig.get(inst);
                    double slPips = spec.getDefaultStopLossPips();
                    double tpPips = spec.getDefaultTakeProfitPips();
                    double pipSize = spec.getPipSize();

                    double stopLossPrice;
                    double takeProfitPrice;

                    if (signal == Direction.BUY) {
                        stopLossPrice = entry - (slPips * pipSize);
                        takeProfitPrice = entry + (tpPips * pipSize);
                    } else {
                        stopLossPrice = entry + (slPips * pipSize);
                        takeProfitPrice = entry - (tpPips * pipSize);
                    }

                    double riskUsd = riskGov.riskPerTradeUsd();

                    broker.enter(
                            inst,
                            signal,
                            c.time(),
                            entry,
                            stopLossPrice,
                            takeProfitPrice,
                            riskUsd,
                            slPips,
                            tpPips,
                            signalStrategyName,
                            pipSize,
                            spec.getContractMultiplier()
                    );

                    riskGov.onTradeOpened();

                    System.out.println("[PAPER] ENTERED " + inst + " " + signal + " strategy=" + signalStrategyName + " tick=" + ticks);
                }
            }
        }

        if (!gotAnyCandle) {
            for (Map.Entry<Instrument, PaperBroker> brokerEntry : brokers.entrySet()) {
                Instrument inst = brokerEntry.getKey();
                PaperBroker broker = brokerEntry.getValue();

                if (broker != null && broker.hasOpenTrade()) {
                    Candle last = lastCandles.get(inst);
                    if (last != null) {
                        int closedBefore = broker.closedTrades().size();
                        broker.forceClose(last.time(), last.close());

                        if (broker.closedTrades().size() > closedBefore) {
                            Trade lastClosed = broker.closedTrades().get(broker.closedTrades().size() - 1);
                            riskGov.onTradeClosed(lastClosed.pnlUsd());
                        }

                        System.out.println("[PAPER] FORCE CLOSED " + inst + " at end of file. tick=" + ticks);
                    }
                }
            }

            System.out.println("[PAPER] No more candles from feeds. Stopping.");
            stop();
        }
    }

    public Map<String, Object> status() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("running", running);
        out.put("tick", ticks);
        out.put("pnlTodayUsd", riskGov.getRealizedPnlTodayUsd());

        long openTrades = brokers.values().stream().filter(PaperBroker::hasOpenTrade).count();
        long closedTrades = brokers.values().stream().mapToLong(b -> b.closedTrades().size()).sum();

        out.put("openTrades", openTrades);
        out.put("closedTrades", closedTrades);
        out.put("tradesToday", riskGov.getTradesToday());

        Map<String, Object> risk = new LinkedHashMap<>();
        risk.put("openTrades", riskGov.getOpenTrades());
        risk.put("tradesToday", riskGov.getTradesToday());
        risk.put("pnlTodayUsd", riskGov.getRealizedPnlTodayUsd());
        risk.put("maxOpenTrades", riskGov.maxOpenTrades());
        risk.put("maxLossPerTradeUsd", riskGov.maxLossPerTradeUsd());
        risk.put("blockedByOpenTradesLimit", riskGov.blockedByOpenTradesLimit);
        risk.put("blockedByTradesPerDayLimit", riskGov.blockedByTradesPerDayLimit);
        risk.put("blockedByDailyLossLimit", riskGov.blockedByDailyLossLimit);
        risk.put("blockedByDailyProfitTarget", riskGov.blockedByDailyProfitTarget);
        out.put("risk", risk);

        Map<String, Object> perSymbol = brokers.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> e.getKey().name(),
                        e -> Map.of(
                                "hasOpenTrade", e.getValue().hasOpenTrade(),
                                "closedTrades", e.getValue().closedTrades().size()
                        ),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        out.put("symbols", perSymbol);
        return out;
    }

    public List<Trade> trades(String symbol) {
        if (symbol == null || symbol.isBlank()) {
            List<Trade> all = new ArrayList<>();
            for (PaperBroker b : brokers.values()) {
                all.addAll(b.closedTrades());
            }
            return all;
        }

        Instrument inst = Instrument.valueOf(symbol.trim().toUpperCase());
        PaperBroker b = brokers.get(inst);
        if (b == null) return List.of();

        return new ArrayList<>(b.closedTrades());
    }

    public Map<String, StrategyDecision> debugStrategies(String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new IllegalArgumentException("symbol is required");
        }

        Instrument inst = Instrument.valueOf(symbol.trim().toUpperCase());
        List<Candle> hist = history.get(inst);
        List<Strategy> strategyList = strategies.get(inst);

        if (hist == null || hist.isEmpty()) {
            throw new IllegalStateException("No candle history available yet for symbol: " + inst);
        }

        if (strategyList == null || strategyList.isEmpty()) {
            throw new IllegalStateException("No strategies configured for symbol: " + inst);
        }

        int i = hist.size() - 1;

        Map<String, StrategyDecision> out = new LinkedHashMap<>();
        for (Strategy strat : strategyList) {
            StrategyDecision decision = strat.explain(hist, i);
            out.put(strat.getClass().getSimpleName(), decision);
        }

        return out;
    }
}