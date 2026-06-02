import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCommissionsStore } from "../../stores/commissionsStore";
import CommissionsPage from "./CommissionsPage";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("../../api/commissions", () => ({
  commissionsApi: { get: mockGet },
}));

const mockData = {
  results: [
    {
      seller: { id: 1, name: "Ana Lima", email: "ana@test.com", phone: "11999" },
      total_commission: "150.00",
    },
    {
      seller: { id: 2, name: "Bruno Costa", email: "bruno@test.com", phone: "11888" },
      total_commission: "75.50",
    },
  ],
  grand_total: "225.50",
};

describe("CommissionsPage", () => {
  beforeEach(() => {
    mockGet.mockResolvedValue(mockData);
    useCommissionsStore.setState({
      startDate: "",
      endDate: "",
      data: null,
      loading: false,
      error: null,
    });
  });

  it("renders the date form", () => {
    render(<CommissionsPage />);
    expect(screen.getByText("Comissões por Período")).toBeInTheDocument();
    expect(screen.getByLabelText("Data inicial")).toBeInTheDocument();
    expect(screen.getByLabelText("Data final")).toBeInTheDocument();
  });

  it("fetches and displays commissions on submit", async () => {
    render(<CommissionsPage />);

    fireEvent.change(screen.getByLabelText("Data inicial"), {
      target: { value: "2024-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Data final"), {
      target: { value: "2024-01-31" },
    });
    fireEvent.click(screen.getByRole("button", { name: /calcular/i }));

    await waitFor(() => {
      expect(screen.getByText("Ana Lima")).toBeInTheDocument();
      expect(screen.getByText("Bruno Costa")).toBeInTheDocument();
    });

    expect(mockGet).toHaveBeenCalledWith("2024-01-01", "2024-01-31");
  });

  it("displays grand total row", async () => {
    render(<CommissionsPage />);

    fireEvent.change(screen.getByLabelText("Data inicial"), {
      target: { value: "2024-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Data final"), {
      target: { value: "2024-01-31" },
    });
    fireEvent.click(screen.getByRole("button", { name: /calcular/i }));

    await waitFor(() => {
      expect(screen.getByText("Total Geral")).toBeInTheDocument();
    });
  });

  it("shows error message on API failure", async () => {
    mockGet.mockRejectedValue(new Error("Erro de conexão"));

    render(<CommissionsPage />);

    fireEvent.change(screen.getByLabelText("Data inicial"), {
      target: { value: "2024-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Data final"), {
      target: { value: "2024-01-31" },
    });
    fireEvent.click(screen.getByRole("button", { name: /calcular/i }));

    await waitFor(() => {
      expect(screen.getByText("Erro de conexão")).toBeInTheDocument();
    });
  });
});
