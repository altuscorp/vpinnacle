import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile login page renders without overflow", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: "tests/visual/.smoke-out/login-390.png",
    fullPage: true,
  });

  const bodyScrollW = await page.evaluate(() => document.body.scrollWidth);
  const viewportW = page.viewportSize()?.width ?? 0;
  expect(bodyScrollW).toBeLessThanOrEqual(viewportW);
});

test("mobile login page renders at 360 without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("http://localhost:3000/login");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: "tests/visual/.smoke-out/login-360.png",
    fullPage: true,
  });

  const bodyScrollW = await page.evaluate(() => document.body.scrollWidth);
  expect(bodyScrollW).toBeLessThanOrEqual(360);
});
