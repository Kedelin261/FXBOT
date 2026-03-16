package com.kenneth.fxbot.api.dto;

import com.kenneth.fxbot.backtest.BacktestEngine;
import com.kenneth.fxbot.backtest.BacktestReport;
import com.kenneth.fxbot.config.BotConfig;
import com.kenneth.fxbot.domain.Candle;
import com.kenneth.fxbot.domain.Instrument;
import com.kenneth.fxbot.marketdata.CsvCandleLoader;
import com.kenneth.fxbot.risk.DailyRiskGovernor;
import com.kenneth.fxbot.schedule.SessionFilter;
import com.kenneth.fxbot.strategy.ThreeCandleMomentumStrategy;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backtest")
public class BacktestController {

    @PostMapping
    public Map<String, Object> run(@Valid @RequestBody BacktestRequest req) throws Exception {

        BotConfig config = new BotConfig();

        CsvCandleLoader loader = new CsvCandleLoader();
        SessionFilter sessionFilter = new SessionFilter(config.marketZone, config.sessions);
        ThreeCandleMomentumStrategy strategy = new ThreeCandleMomentumStrategy(config.consecutiveCandles);

        Map<String, Object> result = new HashMap<>();

        // IMPORTANT: if your BacktestRequest has a FIELD named csvPaths,
        // this is correct: req.csvPaths.entrySet()
        // (NOT req.csvPaths().entrySet())
        for (var entry : req.csvPaths.entrySet()) {
            Instrument instrument = Instrument.valueOf(entry.getKey());

            List<Candle> candles = loader.load(Path.of(entry.getValue()));

            DailyRiskGovernor riskGov = new DailyRiskGovernor(config.riskRules, config.marketZone);

            BacktestReport report = new BacktestEngine().run(
                    instrument,
                    candles,
                    strategy,
                    riskGov,
                    sessionFilter
            );

            result.put(instrument.name(), report);
        }

        return result;
    }
}