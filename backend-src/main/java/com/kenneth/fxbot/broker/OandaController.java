package com.kenneth.fxbot.broker;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/oanda")
public class OandaController {

    private final OandaCandleClient client;

    public OandaController() {
        String token = System.getenv("OANDA_API_TOKEN");
        this.client = new OandaCandleClient(token);
    }

    @GetMapping("/candles/{instrument}")
    public String getCandles(@PathVariable String instrument) {
        return client.getM5Candles(instrument, 10);
    }
}