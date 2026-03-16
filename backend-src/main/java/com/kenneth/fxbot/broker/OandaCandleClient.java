package com.kenneth.fxbot.broker;

import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

public class OandaCandleClient {

    private final String token;
    private final RestTemplate rest = new RestTemplate();

    private static final String BASE_URL = "https://api-fxpractice.oanda.com/v3";

    public OandaCandleClient(String token) {
        this.token = token;
    }

    public String getM5Candles(String instrument, int count) {

        String url = BASE_URL +
                "/instruments/" + instrument +
                "/candles?granularity=M5&count=" + count;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response =
                rest.exchange(url, HttpMethod.GET, entity, String.class);

        return response.getBody();
    }
}