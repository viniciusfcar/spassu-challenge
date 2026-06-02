import { useCommissionsStore } from "../../stores/commissionsStore";

const currency = (value: string) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CommissionsPage() {
  const { startDate, endDate, data, loading, error, setDateRange, fetchCommissions } =
    useCommissionsStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommissions();
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Comissões por Período</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Data inicial
            </label>
            <input
              id="start-date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setDateRange(e.target.value, endDate)}
              className="rounded-md border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              Data final
            </label>
            <input
              id="end-date"
              type="date"
              required
              value={endDate}
              min={startDate}
              onChange={(e) => setDateRange(startDate, e.target.value)}
              className="rounded-md border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Calculando…" : "Calcular"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {data && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Vendedor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">E-mail</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">
                  Total de Comissão
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!data.results.length ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                    Nenhuma venda no período selecionado.
                  </td>
                </tr>
              ) : (
                data.results.map(({ seller, total_commission }) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{seller.name}</td>
                    <td className="px-4 py-3 text-gray-500">{seller.email}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {currency(total_commission)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {data.results.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={2} className="px-4 py-3 font-semibold text-gray-700">
                    Total Geral
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-indigo-700">
                    {currency(data.grand_total)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
