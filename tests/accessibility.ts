import fs from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { test as base } from "@playwright/test";

type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

type LinesFile = {
  lines?: Array<{ id?: string; status?: string }>;
};

type RailcarsFile = {
  generations?: Array<{ id?: string }>;
};

type StationsFile = {
  stations?: Array<{ id?: string }>;
};

const dataDir = path.join(process.cwd(), "data", "systems");

export const localURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

async function readJSON<T>(filePath: string): Promise<T | undefined> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return undefined;
  }
}

export async function getRoutes(): Promise<string[]> {
  const routes = new Set<string>(["/", "/compare", "/search", "/docs/about", "/docs/api"]);
  const systemIds = await fs.readdir(dataDir);

  for (const systemId of systemIds) {
    const systemDir = path.join(dataDir, systemId);
    const stat = await fs.stat(systemDir).catch(() => undefined);

    if (!stat?.isDirectory()) {
      continue;
    }

    routes.add(`/${systemId}`);
    routes.add(`/${systemId}/history`);
    routes.add(`/${systemId}/lines`);
    routes.add(`/${systemId}/railcars`);
    routes.add(`/${systemId}/stations`);

    const lines = await readJSON<LinesFile>(path.join(systemDir, "lines.json"));
    const firstLine = lines?.lines?.find((line) => line.id && line.status !== "disabled");
    if (firstLine?.id) {
      routes.add(`/${systemId}/lines/${firstLine.id}`);
    }

    const railcars = await readJSON<RailcarsFile>(path.join(systemDir, "railcars.json"));
    const firstRailcar = railcars?.generations?.find((railcar) => railcar.id);
    if (firstRailcar?.id) {
      routes.add(`/${systemId}/railcars/${firstRailcar.id}`);
    }

    const stations = await readJSON<StationsFile>(path.join(systemDir, "stations.json"));
    const firstStation = stations?.stations?.find((station) => station.id);
    if (firstStation?.id) {
      routes.add(`/${systemId}/stations/${firstStation.id}`);
    }
  }

  return [...routes].sort();
}

export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, runFixture) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .exclude(".leaflet-marker-icon")
        .withTags(["wcag2a", "wcag21a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]);

    await runFixture(makeAxeBuilder);
  },
});

export { expect } from "@playwright/test";
