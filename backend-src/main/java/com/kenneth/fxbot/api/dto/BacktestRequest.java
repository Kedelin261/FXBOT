package com.kenneth.fxbot.api.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.Map;

public class BacktestRequest {
    @NotEmpty
    public Map<String, String> csvPaths; // "EURUSD" -> "/path/to/EURUSD_M5.csv"
}