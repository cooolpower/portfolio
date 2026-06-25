import fs from "fs";
import path from "path";
import { PORTFOLIO_DATA_KO, PORTFOLIO_DATA_EN } from "../src/constants/data";

const outputDir = __dirname;
const outputPath = path.join(outputDir, "data.json");

const data = {
  ko: PORTFOLIO_DATA_KO,
  en: PORTFOLIO_DATA_EN
};

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
console.log(`Successfully exported data to ${outputPath}`);
