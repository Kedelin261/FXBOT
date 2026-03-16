package com.kenneth.fxbot.config;

import com.kenneth.fxbot.domain.AssetClass;
import com.kenneth.fxbot.domain.Instrument;
import com.kenneth.fxbot.domain.InstrumentSpec;

import java.util.LinkedHashMap;
import java.util.Map;

public class InstrumentConfig {

    private final Map<Instrument, InstrumentSpec> specs = new LinkedHashMap<>();

    public InstrumentConfig() {
        // Major FX pairs
        specs.put(Instrument.AUDUSD, new InstrumentSpec(
                Instrument.AUDUSD, AssetClass.FX, 0.0001, 10.0, 20.0, 100000.0
        ));
        specs.put(Instrument.EURUSD, new InstrumentSpec(
                Instrument.EURUSD, AssetClass.FX, 0.0001, 10.0, 20.0, 100000.0
        ));
        specs.put(Instrument.GBPUSD, new InstrumentSpec(
                Instrument.GBPUSD, AssetClass.FX, 0.0001, 12.0, 24.0, 100000.0
        ));
        specs.put(Instrument.USDCAD, new InstrumentSpec(
                Instrument.USDCAD, AssetClass.FX, 0.0001, 10.0, 20.0, 100000.0
        ));
        specs.put(Instrument.USDCHF, new InstrumentSpec(
                Instrument.USDCHF, AssetClass.FX, 0.0001, 10.0, 20.0, 100000.0
        ));
        specs.put(Instrument.USDJPY, new InstrumentSpec(
                Instrument.USDJPY, AssetClass.FX, 0.01, 10.0, 20.0, 100000.0
        ));

        // Future-ready examples — uncomment once your Instrument enum includes them
        /*
        specs.put(Instrument.XAUUSD, new InstrumentSpec(
                Instrument.XAUUSD, AssetClass.METAL, 0.1, 30.0, 60.0, 100.0
        ));
        specs.put(Instrument.NAS100, new InstrumentSpec(
                Instrument.NAS100, AssetClass.INDEX, 1.0, 50.0, 100.0, 1.0
        ));
        */
    }

    public InstrumentSpec get(Instrument instrument) {
        InstrumentSpec spec = specs.get(instrument);
        if (spec == null) {
            throw new IllegalArgumentException("No instrument spec configured for: " + instrument);
        }
        return spec;
    }

    public boolean contains(Instrument instrument) {
        return specs.containsKey(instrument);
    }

    public Map<Instrument, InstrumentSpec> all() {
        return specs;
    }
}