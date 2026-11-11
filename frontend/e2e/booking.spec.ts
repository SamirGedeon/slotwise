import { test, expect } from "@playwright/test";
import { DateTime } from "luxon";
async function login(
  page: import("@playwright/test").Page,
  email = "owner@slotwise.test",
) {
  await page.goto("/");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("Slotwise-demo-2026!");
  await page.getByRole("button", { name: "Entrar no meu espaço" }).click();
  await expect(
    page.getByRole("heading", { name: "Sua agenda." }),
  ).toBeVisible();
}
test("owner creates catalogs, books, sees conflict, filters and cancels", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await login(page);
  const suffix = Date.now();
  const service = `Consultoria ${suffix}`;
  const professional = `Profissional ${suffix}`;
  await page.getByRole("link", { name: "Serviços", exact: true }).click();
  await page.getByRole("button", { name: "Novo serviço" }).click();
  await page.getByLabel("Nome", { exact: true }).fill(service);
  await page.getByLabel("Duração (minutos)").fill("45");
  await page.getByLabel("Valor (R$)").fill("125.50");
  await page.getByRole("button", { name: "Salvar cadastro" }).click();
  await expect(page.getByRole("heading", { name: service })).toBeVisible();
  await page.getByRole("link", { name: "Equipe", exact: true }).click();
  await page.getByRole("button", { name: "Novo profissional" }).click();
  await page.getByLabel("Nome", { exact: true }).fill(professional);
  await page.getByLabel("Especialidade").fill("Consultoria");
  await page.getByRole("button", { name: "Salvar cadastro" }).click();
  await expect(page.getByRole("heading", { name: professional })).toBeVisible();
  await page.getByRole("link", { name: "Agenda", exact: true }).click();
  const day = DateTime.now()
    .setZone("America/Sao_Paulo")
    .plus({ days: 2 })
    .toISODate()!;
  await page.getByLabel("Data da agenda").fill(day);
  async function book(name: string) {
    await page.getByRole("button", { name: "Novo agendamento" }).click();
    await page.getByLabel("Nome do cliente").fill(name);
    await page.getByLabel("E-mail do cliente").fill("client@example.test");
    await page
      .getByLabel("Serviço", { exact: true })
      .selectOption({ label: `${service} · 45 min · R$ 125,50` });
    await page
      .getByLabel("Profissional", { exact: true })
      .selectOption({ label: professional });
    await page.getByLabel("Horário", { exact: true }).fill("11:00");
    await page.getByRole("button", { name: "Confirmar agendamento" }).click();
  }
  await book(`Cliente ${suffix}`);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page
      .locator(".booking-row")
      .getByText(`Cliente ${suffix}`, { exact: true }),
  ).toBeVisible();
  await book("Tentativa de conflito");
  await expect(page.getByRole("alert")).toContainText("already has a booking");
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByLabel("Buscar cliente ou serviço").fill("inexistente");
  await expect(
    page.getByRole("heading", { name: "Nenhum resultado encontrado" }),
  ).toBeVisible();
  await page.getByLabel("Buscar cliente ou serviço").fill("");
  await page
    .getByRole("button", { name: `Cancelar atendimento de Cliente ${suffix}` })
    .click();
  await page.getByRole("button", { name: "Confirmar cancelamento" }).click();
  await page.getByLabel("Filtrar por status").selectOption("cancelled");
  await expect(page.locator(".booking-row")).toHaveCount(1);
  await expect(page.locator(".booking-row")).toContainText("Cancelado");
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bom ter você por aqui." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("staff cannot see owner actions and mobile layout fits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, "staff@slotwise.test");
  await page.getByRole("link", { name: "Serviços", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Novo serviço", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Somente o proprietário pode cadastrar"),
  ).toBeVisible();
  await page.getByRole("link", { name: "Agenda", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Novo agendamento" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("shows a useful error on incorrect login", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("E-mail", { exact: true }).fill("owner@slotwise.test");
  await page.getByLabel("Senha", { exact: true }).fill("incorrect");
  await page.getByRole("button", { name: "Entrar no meu espaço" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Invalid email or password",
  );
});
