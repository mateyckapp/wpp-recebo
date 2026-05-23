#!/bin/sh
set -e

echo "A executar migrações da base de dados..."
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

echo "A iniciar servidor..."
exec node apps/api/dist/main
