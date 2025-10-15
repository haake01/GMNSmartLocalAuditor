# ==========================
# Script: run_build.ps1
# Autor: Assistente
# Função: Corrige execução bloqueada e roda npm run build
# ==========================

# Libera execução de scripts temporariamente
Write-Host "🔓 Liberando execução de scripts nesta sessão..."
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# Confere a versão do Node e npm
Write-Host "`n🔍 Verificando Node e NPM..."
node -v
npm -v

# Executa o build do projeto
Write-Host "`n🚀 Iniciando build do projeto..."
npm run build

Write-Host "`n✅ Processo finalizado!"
pause
