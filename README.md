# Spassu Code Challenge

Sistema de registro de vendas e cálculo de comissões para papelaria hipotética.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python 3.12 + Django 4.2 + Django REST Framework 3.15 |
| Banco | PostgreSQL 16 |
| Frontend | React 18 + TypeScript 5 + Vite 5 |
| Estado | Zustand 4 |
| Estilo | Tailwind CSS 3 |
| Testes BE | pytest + pytest-django + factory-boy |
| Testes FE | Vitest + React Testing Library |

## Pré-requisitos

- **Docker** 24+ e **Docker Compose** v2  
  _OU_  
- **Python 3.12**, **Node.js 20**, **PostgreSQL 16**

## Rodando com Docker (recomendado)

```bash
git clone <repo-url>
cd spassu-challenge

docker compose up --build
```

Aguarde os serviços subirem (a primeira vez baixa as imagens):

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

### Criar superuser para o Admin

```bash
docker compose exec backend python manage.py createsuperuser
```

---

## Rodando localmente (sem Docker)

### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# Migrations e servidor
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite VITE_API_URL se necessário (padrão: http://localhost:8000/api)

npm run dev
```

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `SECRET_KEY` | — | Chave secreta Django (obrigatória em prod) |
| `DEBUG` | `True` | Modo debug |
| `DB_NAME` | `spassu` | Nome do banco |
| `DB_USER` | `spassu` | Usuário do banco |
| `DB_PASSWORD` | `spassu` | Senha do banco |
| `DB_HOST` | `localhost` | Host do banco |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origins permitidas |

### Frontend (`frontend/.env.local`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_URL` | `/api` | URL base da API |

---

## Testes

### Backend

```bash
cd backend
pytest                         # todos os testes
pytest tests/test_commissions.py -v   # só comissões
pytest --cov=apps              # com cobertura
```

### Frontend

```bash
cd frontend
npm run test              # watch mode
npm run test:coverage     # com cobertura
```

---

## API Endpoints

```
GET/POST    /api/products/
GET/PUT/PATCH/DELETE /api/products/{id}/

GET/POST    /api/clients/
GET/PUT/PATCH/DELETE /api/clients/{id}/

GET/POST    /api/sellers/
GET/PUT/PATCH/DELETE /api/sellers/{id}/

GET/POST    /api/sales/
GET/PUT/PATCH/DELETE /api/sales/{id}/

GET /api/commissions/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Todas as listas suportam paginação (`?page=N`), busca (`?search=termo`) e ordenação (`?ordering=campo`).

### Exemplo — Comissões

```bash
curl "http://localhost:8000/api/commissions/?start_date=2024-01-01&end_date=2024-12-31"
```

```json
{
  "results": [
    {
      "seller": { "id": 1, "name": "Maria Santos", "email": "maria@test.com", "phone": "11999" },
      "total_commission": "1250.00"
    }
  ],
  "grand_total": "1250.00"
}
```

---

## Regra de Comissão

O percentual efetivo de cada item é calculado como:

```
effective = product.commission_percent
if CommissionRule exists for sale.weekday:
    effective = clamp(effective, rule.min_percent, rule.max_percent)

item_commission = quantity × unit_price × effective / 100
sale_commission = Σ item_commissions
```

As regras por dia da semana são configuradas via **Django Admin → Comissões → Regras de Comissão**.

---

## Django Admin

Acesse `/admin/` com o superuser criado. Disponível para gerenciar:

- **Produtos** (código, descrição, valor unitário, % comissão)
- **Clientes** e **Vendedores** (nome, e-mail, telefone)
- **Vendas** com itens inline
- **Regras de Comissão** por dia da semana

---

## Desenvolvimento

### Notas técnicas

- **Twelve-Factor App**: toda configuração via variáveis de ambiente (`python-decouple` no backend, `VITE_*` no frontend).
- **SOLID**: regra de comissão isolada em `apps/commissions/services.py`, sem acoplamento ao ORM nas funções puras.
- **Zustand** gerencia estado de paginação, busca e dados das duas páginas sem prop drilling.
- **TypeScript estrito** (`"strict": true`) com `noUnusedLocals` e `noUnusedParameters`.

### O que implementaria com mais tempo

- Autenticação JWT + permissões por papel
- Deploy automatizado (Railway/Render) com GitHub Actions
- Filtros avançados nas listas (por vendedor, período, cliente)
- Dashboard com métricas agregadas
- Testes E2E com Playwright
