# Script automático para limpar histórico Git e reenviar ao GitHub
Set-Location "E:\PROJETO HIPERAGENTES\Automacoes N8N+SUPABASE+GH\Projetos\AUT - GMN\GMN SmartAudit\BoltNew\Versao 3.0 - 13-10-25\project"

Write-Host "🧹 Limpando histórico do Git..."
Remove-Item -Recurse -Force .git

Write-Host "📁 Recriando repositório Git..."
git init
git add .
git commit -m "Reinicialização limpa do repositório (sem chaves sensíveis)"
git branch -M main

Write-Host "🔗 Conectando ao repositório remoto..."
git remote add origin https://github.com/haake01/bolt-new.git

Write-Host "🚀 Enviando para o GitHub..."
git push -u --force origin main

Write-Host "✅ Processo finalizado com sucesso!"
