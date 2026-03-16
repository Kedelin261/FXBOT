package com.kenneth.fxbot.paper;

import com.kenneth.fxbot.domain.Trade;
import com.kenneth.fxbot.strategy.StrategyDecision;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paper")
public class PaperController {

    private final PaperForwardTestService service;

    public PaperController(PaperForwardTestService service) {
        this.service = service;
    }

    @PostMapping("/start")
    public Map<String, Object> start(@RequestBody PaperForwardTestService.PaperStartRequest req) throws Exception {
        return service.start(req);
    }

    @PostMapping("/stop")
    public Map<String, Object> stop() {
        return service.stop();
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return service.status();
    }

    @GetMapping("/trades")
    public List<Trade> trades(@RequestParam(name = "symbol", required = false) String symbol) {
        return service.trades(symbol);
    }

    @GetMapping(value = "/trades/export", produces = "text/csv")
    public String exportTrades(@RequestParam(name = "symbol", required = false) String symbol) {
        List<Trade> trades = service.trades(symbol);

        StringBuilder csv = new StringBuilder();
        csv.append("instrument,direction,entryTime,entryPrice,exitTime,exitPrice,pnlUsd,strategyName,win,loss\n");

        for (Trade trade : trades) {
            csv.append(escapeCsv(String.valueOf(trade.instrument()))).append(",");
            csv.append(escapeCsv(String.valueOf(trade.direction()))).append(",");
            csv.append(escapeCsv(String.valueOf(trade.entryTime()))).append(",");
            csv.append(trade.entryPrice()).append(",");
            csv.append(escapeCsv(String.valueOf(trade.exitTime()))).append(",");
            csv.append(trade.exitPrice()).append(",");
            csv.append(trade.pnlUsd()).append(",");
            csv.append(escapeCsv(trade.strategyName())).append(",");
            csv.append(trade.isWin()).append(",");
            csv.append(trade.isLoss()).append("\n");
        }

        return csv.toString();
    }

    @GetMapping("/debug/strategy")
    public Map<String, StrategyDecision> debugStrategy(
            @RequestParam(name = "symbol") String symbol
    ) {
        return service.debugStrategies(symbol);
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }

        boolean needsQuotes =
                value.contains(",") ||
                        value.contains("\"") ||
                        value.contains("\n") ||
                        value.contains("\r");

        String escaped = value.replace("\"", "\"\"");

        return needsQuotes ? "\"" + escaped + "\"" : escaped;
    }
}