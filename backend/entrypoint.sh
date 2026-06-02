#!/bin/sh
set -e

# Create migrations directories if they don't exist
mkdir -p apps/sales/migrations apps/catalog/migrations apps/commissions/migrations
touch apps/sales/migrations/__init__.py apps/catalog/migrations/__init__.py apps/commissions/migrations/__init__.py 2>/dev/null || true

python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py collectstatic --noinput 2>/dev/null || true

exec python manage.py runserver 0.0.0.0:8000
