package com.kenneth.fxbot.analytics;

import com.kenneth.fxbot.domain.Trade;
import com.kenneth.fxbot.paper.PaperForwardTestService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/paper")
public class PerformanceController {

    private final PaperForwardTestService paperService;

    public PerformanceController(PaperForwardTestService paperService) {
        this.paperService = paperService;
    }

    @GetMapping("/performance")
    public PerformanceStats performance(
            @RequestParam(name = "symbol", required = false) String symbol
    ) {
        List<Trade> trades = paperService.trades(symbol);
        return PerformanceStats.fromTrades(trades);
    }

    @GetMapping("/performance/by-strategy")
    public Map<String, PerformanceStats> performanceByStrategy(
            @RequestParam(name = "symbol", required = false) String symbol
    ) {
        List<Trade> trades = paperService.trades(symbol);

        Map<String, List<Trade>> grouped = trades.stream()
                .collect(Collectors.groupingBy(
                        trade -> trade.strategyName() == null ? "UNKNOWN" : trade.strategyName(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        Map<String, PerformanceStats> out = new LinkedHashMap<>();
        for (Map.Entry<String, List<Trade>> entry : grouped.entrySet()) {
            out.put(entry.getKey(), PerformanceStats.fromTrades(entry.getValue()));
        }

        return out;
    }

    @GetMapping("/performance/by-symbol-and-strategy")
    public Map<String, PerformanceStats> performanceBySymbolAndStrategy(
            @RequestParam(name = "symbol") String symbol
    ) {
        List<Trade> trades = paperService.trades(symbol);

        Map<String, List<Trade>> grouped = trades.stream()
                .collect(Collectors.groupingBy(
                        trade -> trade.strategyName() == null ? "UNKNOWN" : trade.strategyName(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        Map<String, PerformanceStats> out = new LinkedHashMap<>();
        for (Map.Entry<String, List<Trade>> entry : grouped.entrySet()) {
            out.put(entry.getKey(), PerformanceStats.fromTrades(entry.getValue()));
        }

        return out;
    }

    @GetMapping("/equity")
    public List<PerformanceStats.EquityPoint> equity(
            @RequestParam(name = "symbol", required = false) String symbol
    ) {
        List<Trade> trades = paperService.trades(symbol);
        return PerformanceStats.equityCurve(trades);
    }

    @GetMapping("/equity/by-strategy")
    public Map<String, List<PerformanceStats.EquityPoint>> equityByStrategy(
            @RequestParam(name = "symbol", required = false) String symbol
    ) {
        List<Trade> trades = paperService.trades(symbol);

        Map<String, List<Trade>> grouped = trades.stream()
                .collect(Collectors.groupingBy(
                        trade -> trade.strategyName() == null ? "UNKNOWN" : trade.strategyName(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        Map<String, List<PerformanceStats.EquityPoint>> out = new LinkedHashMap<>();
        for (Map.Entry<String, List<Trade>> entry : grouped.entrySet()) {
            out.put(entry.getKey(), PerformanceStats.equityCurve(entry.getValue()));
        }

        return out;
    }

    @GetMapping("/equity/by-symbol-and-strategy")
    public Map<String, List<PerformanceStats.EquityPoint>> equityBySymbolAndStrategy(
            @RequestParam(name = "symbol") String symbol
    ) {
        List<Trade> trades = paperService.trades(symbol);

        Map<String, List<Trade>> grouped = trades.stream()
                .collect(Collectors.groupingBy(
                        trade -> trade.strategyName() == null ? "UNKNOWN" : trade.strategyName(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        Map<String, List<PerformanceStats.EquityPoint>> out = new LinkedHashMap<>();
        for (Map.Entry<String, List<Trade>> entry : grouped.entrySet()) {
            out.put(entry.getKey(), PerformanceStats.equityCurve(entry.getValue()));
        }

        return out;
    }

    @GetMapping("/leaderboard/strategies")
    public List<StrategyLeaderboardEntry> strategyLeaderboard(
            @RequestParam(name = "symbol", required = false) String symbol
    ) {
        List<Trade> trades = paperService.trades(symbol);

        Map<String, List<Trade>> grouped = trades.stream()
                .collect(Collectors.groupingBy(
                        trade -> trade.strategyName() == null ? "UNKNOWN" : trade.strategyName(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<StrategyLeaderboardEntry> leaderboard = new ArrayList<>();

        for (Map.Entry<String, List<Trade>> entry : grouped.entrySet()) {
            String strategyName = entry.getKey();
            PerformanceStats stats = PerformanceStats.fromTrades(entry.getValue());

            double score =
                    stats.totalPnlUsd
                            + (stats.profitFactor * 100.0)
                            + stats.winRate
                            - stats.maxDrawdownUsd;

            leaderboard.add(new StrategyLeaderboardEntry(
                    strategyName,
                    stats.totalTrades,
                    stats.wins,
                    stats.losses,
                    stats.winRate,
                    stats.totalPnlUsd,
                    stats.averageWinUsd,
                    stats.averageLossUsd,
                    stats.profitFactor,
                    stats.maxDrawdownUsd,
                    score
            ));
        }

        leaderboard.sort(Comparator.comparingDouble((StrategyLeaderboardEntry e) -> e.score).reversed());
        return leaderboard;
    }

    @GetMapping("/leaderboard/symbols")
    public List<SymbolLeaderboardEntry> symbolLeaderboard(
            @RequestParam(name = "strategyName", required = false) String strategyName
    ) {
        List<Trade> trades = paperService.trades(null);

        if (strategyName != null && !strategyName.isBlank()) {
            trades = trades.stream()
                    .filter(t -> t.strategyName() != null && t.strategyName().equalsIgnoreCase(strategyName))
                    .collect(Collectors.toList());
        }

        Map<String, List<Trade>> grouped = trades.stream()
                .collect(Collectors.groupingBy(
                        trade -> trade.instrument().name(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<SymbolLeaderboardEntry> leaderboard = new ArrayList<>();

        for (Map.Entry<String, List<Trade>> entry : grouped.entrySet()) {
            String symbol = entry.getKey();
            PerformanceStats stats = PerformanceStats.fromTrades(entry.getValue());

            double score =
                    stats.totalPnlUsd
                            + (stats.profitFactor * 100.0)
                            + stats.winRate
                            - stats.maxDrawdownUsd;

            leaderboard.add(new SymbolLeaderboardEntry(
                    symbol,
                    stats.totalTrades,
                    stats.wins,
                    stats.losses,
                    stats.winRate,
                    stats.totalPnlUsd,
                    stats.averageWinUsd,
                    stats.averageLossUsd,
                    stats.profitFactor,
                    stats.maxDrawdownUsd,
                    score
            ));
        }

        leaderboard.sort(Comparator.comparingDouble((SymbolLeaderboardEntry e) -> e.score).reversed());
        return leaderboard;
    }
}