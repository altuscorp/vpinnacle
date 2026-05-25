import { test, expect } from "@playwright/test";

test("inline status edit changes a task's status from the table", async ({ page }) => {
  await page.goto("/tasks");
  // Find the first status chip in the table — InlineStatusCell renders it as a button.
  const firstStatusButton = page.locator("table tbody tr").first().locator('button[aria-haspopup="listbox"], button[aria-haspopup="menu"]').first();
  await firstStatusButton.click();
  // The popover should show at least one alternative status to pick.
  const popoverOption = page.getByRole("menuitem").or(page.getByRole("option")).first();
  await expect(popoverOption).toBeVisible({ timeout: 4000 });
  const altText = (await popoverOption.innerText()).trim();
  await popoverOption.click();
  // A toast confirms — the project uses fireToast which renders within a portal.
  await expect(page.locator('[role="status"], [data-toast]').first()).toBeVisible({ timeout: 4000 });
  // Chip label should reflect the new status (case-insensitive partial match).
  await expect(firstStatusButton).toContainText(new RegExp(altText, "i"));
});
