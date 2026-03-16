package com.kenneth.fxbot.domain;

public class InstrumentSpec {

    private final Instrument instrument;
    private final AssetClass assetClass;
    private final double pipSize;
    private final double defaultStopLossPips;
    private final double defaultTakeProfitPips;
    private final double contractMultiplier;

    public InstrumentSpec(
            Instrument instrument,
            AssetClass assetClass,
            double pipSize,
            double defaultStopLossPips,
            double defaultTakeProfitPips,
            double contractMultiplier
    ) {
        this.instrument = instrument;
        this.assetClass = assetClass;
        this.pipSize = pipSize;
        this.defaultStopLossPips = defaultStopLossPips;
        this.defaultTakeProfitPips = defaultTakeProfitPips;
        this.contractMultiplier = contractMultiplier;
    }

    public Instrument getInstrument() {
        return instrument;
    }

    public AssetClass getAssetClass() {
        return assetClass;
    }

    public double getPipSize() {
        return pipSize;
    }

    public double getDefaultStopLossPips() {
        return defaultStopLossPips;
    }

    public double getDefaultTakeProfitPips() {
        return defaultTakeProfitPips;
    }

    public double getContractMultiplier() {
        return contractMultiplier;
    }
}