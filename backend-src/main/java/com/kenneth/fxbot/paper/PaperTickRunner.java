package com.kenneth.fxbot.paper;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PaperTickRunner {

    private final PaperForwardTestService service;
    private long ticks = 0;

    public PaperTickRunner(PaperForwardTestService service) {
        this.service = service;
    }

    @Scheduled(fixedDelay = 250)
    public void tick() {
        ticks++;

        if (ticks % 20 == 0) {
            System.out.println("[PAPER] tick=" + ticks);
        }

        service.tick();
    }
}