import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSalesStore } from "../../stores/salesStore";
import SalesPage from "./SalesPage";

const { mockList, mockProductsList, mockClientsList, mockSellersList } = vi.hoisted(() => ({
  mockList: vi.fn(),
  mockProductsList: vi.fn(),
  mockClientsList: vi.fn(),
  mockSellersList: vi.fn(),
}));

vi.mock("../../api/sales", () => ({
  salesApi: {
    list: mockList,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("../../api/catalog", () => ({
  catalogApi: {
    products: { list: mockProductsList },
    clients: { list: mockClientsList },
    sellers: { list: mockSellersList },
  },
}));

const mockPage = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      invoice_number: "NF-001",
      datetime: "2024-06-15T14:30:00Z",
      client: 1,
      client_detail: { id: 1, name: "João Silva", email: "joao@test.com", phone: "11999" },
      seller: 2,
      seller_detail: { id: 2, name: "Maria Santos", email: "maria@test.com", phone: "11888" },
      items: [{ id: 1, product: 3, quantity: 2 }],
      total_value: "200.00",
    },
  ],
};

const renderPage = () =>
  render(
    <BrowserRouter>
      <SalesPage />
    </BrowserRouter>
  );

describe("SalesPage", () => {
  beforeEach(() => {
    mockList.mockResolvedValue(mockPage);
    mockProductsList.mockResolvedValue([
      { id: 3, code: "P001", description: "Caneta", unit_price: "2.50", commission_percent: "5.00" },
    ]);
    mockClientsList.mockResolvedValue([
      { id: 1, name: "João Silva", email: "joao@test.com", phone: "11999" },
    ]);
    mockSellersList.mockResolvedValue([
      { id: 2, name: "Maria Santos", email: "maria@test.com", phone: "11888" },
    ]);
    useSalesStore.setState({ page: null, loading: false, error: null });
  });

  it("renders page title and new sale button", () => {
    renderPage();
    expect(screen.getByText("Vendas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nova Venda" })).toBeInTheDocument();
  });

  it("displays sales list after load", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("NF-001")).toBeInTheDocument();
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    });
  });

  it("opens create modal when Nova Venda is clicked", async () => {
    renderPage();
    await waitFor(() => screen.getByText("NF-001"));

    fireEvent.click(screen.getByRole("button", { name: "Nova Venda" }));

    expect(screen.getByRole("heading", { name: "Nova Venda" })).toBeInTheDocument();
  });

  it("opens edit modal when Editar is clicked", async () => {
    renderPage();
    await waitFor(() => screen.getByText("NF-001"));

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByRole("heading", { name: "Editar Venda" })).toBeInTheDocument();
  });
});
