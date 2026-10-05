import { bootstrap } from "./bootstrap/main";

bootstrap().catch((error) => {
  console.error("Failed to start application.");
  console.error(error);

  process.exit(1);
});