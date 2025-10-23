#!/bin/bash

# 🚀 CONFIGURACIÓN AUTOMÁTICA DE GITHUB PAGES
# Este script configurará GitHub Pages para el repositorio

echo "🚀 Configurando GitHub Pages para FinFlow Intelligence..."

# Información del repositorio
REPO_OWNER="leomos2022"
REPO_NAME="web-semantica"
GITHUB_API="https://api.github.com"

echo "📁 Repositorio: $REPO_OWNER/$REPO_NAME"
echo "🌐 URL esperada: https://$REPO_OWNER.github.io/$REPO_NAME/"

# Instrucciones manuales (ya que no tenemos token API)
echo ""
echo "🔧 PASOS PARA CONFIGURAR GITHUB PAGES MANUALMENTE:"
echo "=================================================="
echo ""
echo "1. 🌐 Ve a: https://github.com/$REPO_OWNER/$REPO_NAME"
echo "2. 🔧 Clic en 'Settings' (pestaña en el repositorio)"
echo "3. 📄 Busca 'Pages' en el menú lateral izquierdo"
echo "4. 📋 En 'Source', selecciona:"
echo "   - Source: 'Deploy from a branch'"
echo "   - Branch: 'main'"
echo "   - Folder: '/ (root)'"
echo "5. 💾 Clic en 'Save'"
echo "6. ⏳ Espera 2-3 minutos para el deployment"
echo "7. ✅ Tu sitio estará en: https://$REPO_OWNER.github.io/$REPO_NAME/"
echo ""

# Verificar archivos necesarios
echo "✅ VERIFICACIÓN DE ARCHIVOS:"
echo "============================"

files_to_check=("index.html" "styles.css" "script.js" "README.md")
all_present=true

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Presente"
    else
        echo "❌ $file - FALTANTE"
        all_present=false
    fi
done

if [ "$all_present" = true ]; then
    echo ""
    echo "🎉 ¡Todos los archivos necesarios están presentes!"
    echo "📱 Tu aplicación web está lista para GitHub Pages"
else
    echo ""
    echo "⚠️  Algunos archivos faltan. Verifica antes de activar Pages."
fi

echo ""
echo "🔗 ENLACES ÚTILES:"
echo "=================="
echo "📁 Repositorio: https://github.com/$REPO_OWNER/$REPO_NAME"
echo "⚙️  Settings: https://github.com/$REPO_OWNER/$REPO_NAME/settings/pages"
echo "🌐 GitHub Pages: https://$REPO_OWNER.github.io/$REPO_NAME/"
echo "🔧 Actions: https://github.com/$REPO_OWNER/$REPO_NAME/actions"

echo ""
echo "✨ ¡LISTO! Sigue los pasos manuales para activar GitHub Pages"