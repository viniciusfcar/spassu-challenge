import { useEffect, useState } from "react";
import { catalogApi } from "../../api/catalog";
import type { Client, Product, Sale, SalePayload, Seller } from "../../types";

interface ItemRow {
  product: number;
  quantity: number;
}

interface Props {
  initial?: Sale;
  onSubmit: (payload: SalePayload) => Promise<void>;
  onCancel: () => void;
}

const EMPTY_ITEM: ItemRow = { product: 0, quantity: 1 };

export default function SaleForm({ initial, onSubmit, onCancel }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoice_number ?? "");
  const [datetime, setDatetime] = useState(
    initial?.datetime ? initial.datetime.slice(0, 16) : ""
  );
  const [client, setClient] = useState<number>(initial?.client ?? 0);
  const [seller, setSeller] = useState<number>(initial?.seller ?? 0);
  const [items, setItems] = useState<ItemRow[]>(
    initial?.items.length
      ? initial.items.map((i) => ({ product: i.product, quantity: i.quantity }))
      : [{ ...EMPTY_ITEM }]
  );

  useEffect(() => {
    Promise.all([catalogApi.products.list(), catalogApi.clients.list(), catalogApi.sellers.list()])
      .then(([p, c, s]) => {
        setProducts(p);
        setClients(c);
        setSellers(s);
        if (!initial) {
          if (c.length) setClient(c[0].id);
          if (s.length) setSeller(s[0].id);
          if (p.length) setItems([{ product: p[0].id, quantity: 1 }]);
        }
      })
      .catch(() => setError("Falha ao carregar dados do catálogo."));
  }, [initial]);

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof ItemRow, value: number) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length || items.some((i) => !i.product || i.quantity < 1)) {
      setError("Adicione ao menos um item válido.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        invoice_number: invoiceNumber,
        datetime: new Date(datetime).toISOString(),
        client,
        seller,
        items,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nº Nota Fiscal
          </label>
          <input
            type="text"
            required
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data/Hora
          </label>
          <input
            type="datetime-local"
            required
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <select
            required
            value={client}
            onChange={(e) => setClient(Number(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendedor
          </label>
          <select
            required
            value={seller}
            onChange={(e) => setSeller(Number(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Itens</span>
          <button
            type="button"
            onClick={addItem}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Adicionar item
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={item.product}
                onChange={(e) => updateItem(index, "product", Number(e.target.value))}
                className="flex-1 rounded-md border-gray-300 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.description}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                className="w-20 rounded-md border-gray-300 shadow-sm text-sm text-center focus:ring-indigo-500 focus:border-indigo-500"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-gray-400 hover:text-red-500 text-lg leading-none"
                  aria-label="Remover item"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Salvando…" : initial ? "Salvar" : "Criar Venda"}
        </button>
      </div>
    </form>
  );
}
