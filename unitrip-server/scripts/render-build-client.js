import { execSync } from "node:child_process";

// Render's default build is `npm install` in unitrip-server. The React app is
// not committed (dist is gitignored), so install must compile it or /about
// never reaches the live site. RENDER is set by Render itself.
if (process.env.RENDER === "true") {
  execSync("npm run build:client", { stdio: "inherit", env: process.env });
}
