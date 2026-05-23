#!/bin/sh
set -e

echo "A iniciar servidor..."
exec node apps/api/dist/main
