import { closeInput } from "./presentation/input";
import { runMenu } from "./presentation/menu";
import { printError } from "./presentation/output";
import { loadConfig } from "./storage/configFile";

try {
  const config = await loadConfig();
  await runMenu(config);
} catch (error) {
  printError(error);
} finally {
  closeInput();
}
