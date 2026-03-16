package com.kenneth.fxbot.marketdata;

import com.kenneth.fxbot.domain.Candle;

import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class CsvCandleLoader {

    // Matches: 04.03.2026 10:00:00.000 UTC
    private static final DateTimeFormatter OANDA_LIKE =
            DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss.SSS z");

    public List<Candle> load(Path path) throws Exception {
        List<Candle> candles = new ArrayList<>();

        try (BufferedReader br = Files.newBufferedReader(path)) {
            String header = br.readLine(); // header row
            if (header == null) return candles;

            String line;
            while ((line = br.readLine()) != null) {
                if (line.isBlank()) continue;

                String[] p = line.split(",");

                // Defensive: ensure enough columns
                if (p.length < 6) continue;

                Instant time = parseTime(p[0].trim());

                double open = Double.parseDouble(p[1].trim());
                double high = Double.parseDouble(p[2].trim());
                double low  = Double.parseDouble(p[3].trim());
                double close= Double.parseDouble(p[4].trim());
                double volume = Double.parseDouble(p[5].trim());

                candles.add(new Candle(time, open, high, low, close, volume));
            }
        }

        return candles;
    }

    private Instant parseTime(String raw) {
        // 1) Try ISO-8601 first (ex: 2026-03-04T10:00:00Z)
        try {
            return Instant.parse(raw);
        } catch (Exception ignored) {}

        // 2) Try your CSV format (ex: 04.03.2026 10:00:00.000 UTC)
        ZonedDateTime zdt = ZonedDateTime.parse(raw, OANDA_LIKE);
        return zdt.toInstant();
    }
}