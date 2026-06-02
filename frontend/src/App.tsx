import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CommissionsPage from "./pages/Commissions/CommissionsPage";
import SalesPage from "./pages/Sales/SalesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/vendas" replace />} />
          <Route path="/vendas" element={<SalesPage />} />
          <Route path="/comissoes" element={<CommissionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
