const thresholds = {
  temperature: { high: 85, low: -10 },
  color: { min: 10, max: 200 },
  intensity: { high: 1000, low: 100 },
  current: { high: 50, low: 5 },
  pressure: { high: 1015, low: 980 },
};

module.exports = function generateSolarPanelWarnings(body) {
  const warnings = [];

  const { temperature, color, intensity, current, pressure } = body;

  // Environmental Warnings
  if (temperature > thresholds.temperature.high) {
    warnings.push({
      type: "environmental",
      title: "Extreme Temperature",
      description: `The current temperature is ${temperature}°C, which exceeds the high threshold of ${thresholds.temperature.high}°C. This could potentially damage the solar panel components.`,
    });
  } else if (temperature < thresholds.temperature.low) {
    warnings.push({
      type: "environmental",
      title: "Extreme Temperature",
      description: `The current temperature is ${temperature}°C, which is below the low threshold of ${thresholds.temperature.low}°C. This could potentially reduce the efficiency of the solar panel.`,
    });
  }

  if (color < thresholds.color.min || color > thresholds.color.max) {
    warnings.push({
      type: "environmental",
      title: "Color Deviation",
      description: `The color reading is ${color}, which is outside the expected range of ${thresholds.color.min} to ${thresholds.color.max}. This could indicate an issue with the panel's surface or external conditions.`,
    });
  }

  // Performance Warnings
  if (intensity > thresholds.intensity.high) {
    warnings.push({
      type: "performance",
      title: "High Intensity",
      description: `The light intensity is ${intensity} lx, which exceeds the high threshold of ${thresholds.intensity.high} lx. This may indicate unusually bright conditions that could affect the panel's performance.`,
    });
  } else if (intensity < thresholds.intensity.low) {
    warnings.push({
      type: "performance",
      title: "Low Intensity",
      description: `The light intensity is ${intensity} lx, which is below the low threshold of ${thresholds.intensity.low} lx. This may indicate insufficient sunlight, affecting the panel's energy output.`,
    });
  }
  if (current < thresholds.current.low) {
    warnings.push({
      type: "performance",
      title: "Low Current",
      description: `The current reading is ${current} A, which is below the low threshold of ${thresholds.current.low} A. This could indicate an issue with the panel's energy generation.`,
    });
  }

  // Component Warnings

  if (current > thresholds.current.high) {
    warnings.push({
      type: "component",
      title: "High Current",
      description: `The current reading is ${current} A, which exceeds the high threshold of ${thresholds.current.high} A. This could indicate a fault in the electrical system of the panel.`,
    });
  }

  // Operational Warnings
  // Here you can add more specific operational warnings if necessary
  if (current === 0) {
    warnings.push({
      type: "operational",
      title: "No Current",
      description: `The current reading is 0 A, indicating that the panel is not generating any electricity. This could be due to a system fault or a lack of sunlight.`,
    });
  }
  if (
    pressure < thresholds.pressure.low ||
    pressure > thresholds.pressure.high
  ) {
    warnings.push({
      type: "operational",
      title: "Pressure Anomaly",
      description: `The current pressure is ${pressure} hPa, which is outside the typical operational range. This could affect the performance and safety of the solar panel.`,
    });
  }

  return warnings;
};
