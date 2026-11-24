import { successMessage } from "../presentation/output";
import { saveSettings, toggleUnit as switchUnit } from "../storage/settingsStorage";
import type { AppConfig } from "../types/Settings";

export async function toggleUnit(config: AppConfig): Promise<void> {
  const unit = switchUnit(config);
  await saveSettings(config);
  successMessage(`Unidad de temperatura cambiada a °${unit}.`);
}
