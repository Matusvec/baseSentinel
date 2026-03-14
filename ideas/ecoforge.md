# ECOFORGE — AI Sustainability Command Center
## Sustainability Track | Highest Upside, Highest Risk

---

## THE CONCEPT

The ultimate kitchen-sink play. Combines GreenPulse's IoT hardware monitoring with a financial ROI engine. The station monitors environmental conditions AND calculates real dollar savings:

> "Based on 3 hours of data, this room is wasting $4.20/day in unnecessary lighting and HVAC. Annualized across your 50,000 sq ft facility, that's $180,000 in savings and 47 tons of CO2 reduced."

Your MechE partner explains the sensor engineering. Her IB background sells the financial model. You demo the tech.

---

## WHY IT'S THE MOST DANGEROUS OPTION

**Upside:** If you pull it off, it's untouchable. No other team will have hardware + environmental AI + financial modeling + voice + agent architecture in one project.

**Downside:** You're trying to nail all of this in 24 hours with 2 people. If hardware debugging eats 3 hours AND the financial model needs another 2 hours of tuning, your core agent architecture gets squeezed.

**The Rule:** Build GreenPulse first (Concept 1). If you're ahead of schedule by 8 PM Saturday, layer in the financial modeling. EcoForge is GreenPulse with a financial upgrade — not a separate project.

---

## WHAT EcoForge ADDS OVER GreenPulse

| Feature | GreenPulse | EcoForge Addition |
|---------|-----------|-------------------|
| Sensor monitoring | ✅ | Same |
| AI analysis | ✅ | Same |
| Voice interface | ✅ | Same |
| Agent architecture | ✅ | Same |
| **Energy cost calculator** | ❌ | ✅ Real-time $/hour waste estimation |
| **Annual projection engine** | ❌ | ✅ "At this rate, $180K/yr savings" |
| **ROI dashboard** | ❌ | ✅ Business-facing metrics (payback period, NPV) |
| **Carbon credit valuation** | ❌ | ✅ "47 tons CO2 = $X at current carbon prices" |
| **Building comparison** | ❌ | ✅ "vs. average building in your region" |

---

## THE FINANCIAL MODEL (Add-On Module)

```javascript
// lib/financial-model.js

const ENERGY_RATES = {
  ohio_avg_kwh: 0.12,      // $/kWh Ohio average
  carbon_credit_per_ton: 50, // $/ton CO2 (approximate)
  natural_gas_per_therm: 1.20,
};

export function calculateWaste(sensorData, buildingProfile) {
  const { temperature_c, light_lux, co2_approx_ppm, humidity_pct } = sensorData;
  const { area_sqft, energy_rate_kwh } = buildingProfile;

  // Lighting waste: if light > 500 lux and it's after 6 PM (or room empty)
  const excessLightPct = Math.max(0, (light_lux - 300) / 300);
  const lightingWaste_kwh = excessLightPct * 0.01 * area_sqft; // ~10W per 1000sqft excess

  // HVAC waste: if temp is > 2°C above/below optimal (22°C)
  const tempDeviation = Math.abs(temperature_c - 22);
  const hvacWaste_kwh = tempDeviation > 2
    ? (tempDeviation - 2) * 0.05 * area_sqft / 1000
    : 0;

  // CO2 = poor ventilation = HVAC running inefficiently
  const ventilationWaste_kwh = co2_approx_ppm > 800
    ? ((co2_approx_ppm - 800) / 1000) * 0.02 * area_sqft / 1000
    : 0;

  const totalWaste_kwh_per_hour = lightingWaste_kwh + hvacWaste_kwh + ventilationWaste_kwh;
  const costPerHour = totalWaste_kwh_per_hour * energy_rate_kwh;
  const annualCost = costPerHour * 8760; // 24*365

  // CO2 impact (0.42 kg CO2 per kWh US average)
  const co2_kg_per_hour = totalWaste_kwh_per_hour * 0.42;
  const co2_tons_annual = (co2_kg_per_hour * 8760) / 1000;
  const carbonCreditValue = co2_tons_annual * ENERGY_RATES.carbon_credit_per_ton;

  return {
    waste_kwh_per_hour: Math.round(totalWaste_kwh_per_hour * 100) / 100,
    cost_per_hour: Math.round(costPerHour * 100) / 100,
    cost_per_day: Math.round(costPerHour * 24 * 100) / 100,
    annual_savings_potential: Math.round(annualCost),
    co2_tons_annual: Math.round(co2_tons_annual * 10) / 10,
    carbon_credit_value: Math.round(carbonCreditValue),
    breakdown: {
      lighting: Math.round(lightingWaste_kwh * energy_rate_kwh * 24 * 100) / 100,
      hvac: Math.round(hvacWaste_kwh * energy_rate_kwh * 24 * 100) / 100,
      ventilation: Math.round(ventilationWaste_kwh * energy_rate_kwh * 24 * 100) / 100,
    },
  };
}
```

### ROI Dashboard Component (Add to existing dashboard)

```jsx
// components/ROIPanel.jsx
export function ROIPanel({ financials }) {
  if (!financials) return null;
  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard
        label="Wasting right now"
        value={`$${financials.cost_per_hour}/hr`}
        trend="up"
        color="red"
      />
      <MetricCard
        label="Annual savings potential"
        value={`$${financials.annual_savings_potential.toLocaleString()}`}
        color="green"
      />
      <MetricCard
        label="CO₂ reduction"
        value={`${financials.co2_tons_annual} tons/yr`}
        subtext={`Worth $${financials.carbon_credit_value} in carbon credits`}
        color="teal"
      />
    </div>
  );
}
```

---

## EXECUTION STRATEGY: BUILD GREENPULSE FIRST, UPGRADE IF TIME ALLOWS

**Decision point: 8 PM Saturday**

| Status at 8 PM | Action |
|----------------|--------|
| Core GreenPulse working + polished | Add financial model → become EcoForge |
| Core working but rough | Polish GreenPulse, skip financial layer |
| Still debugging hardware/agent | Fix what's broken, ship GreenPulse |

The financial model is ~200 lines of code and 1-2 UI components. It's a 2-hour add-on if everything else is solid.

---

## PITCH UPGRADE (What Changes from GreenPulse)

**Same structure, but the closing is devastating:**

**[2:45-3:00] Impact (Partner — IB + MechE credibility)**
"We monitored this room for 3 hours during the hackathon. GreenPulse identified $4.20/day in energy waste — that's $1,533/year for a single room. Scale that across a 200-room university building: $306,000 in annual savings and 127 tons of CO2. The ROI on a GreenPulse deployment is under 6 months. And because we use open-weight models, every number is auditable."

*This is why the IB background is a weapon. She can deliver financial projections with credibility.*

---

## TRACK COVERAGE: IDENTICAL TO GREENPULSE (7 pools)

Same tracks, same integrations. The financial model doesn't add new tracks — it strengthens your pitch for the ones you're already in, especially:
- **Sustainability judges:** "Real dollar impact, not just environmental awareness"
- **Jaseci judges:** Financial modeling becomes another tool the agent calls autonomously
- **Overall winner:** Business viability scores higher with concrete ROI numbers
