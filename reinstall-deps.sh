#!/bin/bash
echo "🧹 Limpiando dependencias del backend..."
rm -rf node_modules package-lock.json

echo "📦 Instalando dependencias del backend..."
npm install

echo ""
echo "🧹 Limpiando dependencias del frontend..."
cd reactfrontend
rm -rf node_modules package-lock.json

echo "📦 Instalando dependencias del frontend..."
npm install

cd ..

echo ""
echo "✅ Dependencias reinstaladas!"
echo ""
echo "Para iniciar el proyecto:"
echo "  Backend:  npm run dev"
echo "  Frontend: cd reactfrontend && npm run dev"
