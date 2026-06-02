import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { useSalesStore } from "../../stores/salesStore";
import type { Sale, SalePayload } from "../../types";
import SaleForm from "./SaleForm";

type ModalState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; sale: Sale };

const currency = (value?: string) =>
  value
    ? Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";

const formatDate = (iso: string) =>
  format(new Date(iso), "dd/MM/yyyy HH:mm", { locale: ptBR });

export default function SalesPage() {
  const { page, loading, error, fetchSales, createSale, updateSale, deleteSale } =
    useSalesStore();
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchSales(1, "");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSales(1, search);
  };

  const handleSubmit = async (payload: SalePayload) => {
    if (modal.kind === "create") await createSale(payload);
    if (modal.kind === "edit") await updateSale(modal.sale.id, payload);
    setModal({ kind: "closed" });
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    await deleteSale(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Vendas</h1>
        <button
          onClick={() => setModal({ kind: "create" })}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Nova Venda
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nota fiscal, cliente ou vendedor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Buscar
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Nota Fiscal</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Data/Hora</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Cliente</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Vendedor</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Carregando…
                </td>
              </tr>
            ) : !page?.results.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma venda encontrada.
                </td>
              </tr>
            ) : (
              page.results.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-700">{sale.invoice_number}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(sale.datetime)}</td>
                  <td className="px-4 py-3 text-gray-700">{sale.client_detail?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{sale.seller_detail?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {currency(sale.total_value)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setModal({ kind: "edit", sale })}
                      className="text-indigo-600 hover:text-indigo-800 mr-4 text-xs font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteId(sale.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {page && page.count > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>{page.count} venda(s) no total</span>
          <div className="flex gap-2">
            <button
              disabled={!page.previous}
              onClick={() => fetchSales(useSalesStore.getState().currentPage - 1)}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
              ← Anterior
            </button>
            <button
              disabled={!page.next}
              onClick={() => fetchSales(useSalesStore.getState().currentPage + 1)}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}

      {modal.kind !== "closed" && (
        <Modal
          title={modal.kind === "create" ? "Nova Venda" : "Editar Venda"}
          onClose={() => setModal({ kind: "closed" })}
        >
          <SaleForm
            initial={modal.kind === "edit" ? modal.sale : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setModal({ kind: "closed" })}
          />
        </Modal>
      )}

      {deleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-gray-600 mb-5">
              Tem certeza que deseja excluir esta venda? A ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
