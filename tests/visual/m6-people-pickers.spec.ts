import { test, expect } from "@playwright/test";

test("Create Task — Initiator combobox filters and selects", async ({ page }) => {
  await page.goto("/tasks/new");
  // Wait for the form to be ready.
  const initiatorTrigger = page.locator('button[aria-haspopup="listbox"]').first();
  await initiatorTrigger.click();
  const search = page.getByPlaceholder(/search employees/i).first();
  await search.fill("ma");
  // Expect at least one row visible matching "Ma…".
  const items = page.getByRole("option");
  await expect(items.first()).toBeVisible();
  await items.first().click();
  // After selecting, the trigger should no longer show the placeholder text.
  await expect(initiatorTrigger).not.toHaveText(/select an employee/i);
});

test("Create Task — Doer multi-combobox adds chip", async ({ page }) => {
  await page.goto("/tasks/new");
  // Pick the Doer trigger by its accessible content (placeholder "Pick one or more").
  const doerTrigger = page.locator(
    'button[aria-haspopup="listbox"]:has-text("Pick one or more")',
  );
  await expect(doerTrigger).toBeVisible();
  await doerTrigger.click();
  await page.getByPlaceholder(/search employees/i).fill("ke");
  const opt = page.getByRole("option").first();
  await opt.click();
  // After selecting, the placeholder is replaced by a chip — text "Pick one or more"
  // should no longer be present in the trigger.
  await expect(doerTrigger).toHaveCount(0);
});
