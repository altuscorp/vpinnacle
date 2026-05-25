import { test, expect } from "@playwright/test";

test("⌘K opens palette on non-tasks pages and navigates", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+K");
  const input = page.getByPlaceholder("Search tasks, employees, pages…");
  await expect(input).toBeVisible();
  await input.fill("admin");
  // First admin row should focus; press Enter to navigate.
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/admin\//);
});

test("⌘K is suppressed on /tasks (hands focus to search bar)", async ({ page }) => {
  await page.goto("/tasks");
  await page.keyboard.press("Control+K");
  // Palette should NOT mount.
  await expect(
    page.getByPlaceholder("Search tasks, employees, pages…"),
  ).toHaveCount(0);
  // The /tasks search bar should be focused.
  await expect(page.locator('[data-search-bar="tasks"]')).toBeFocused();
});
