# ============================================================
# GMN SMARTAUDIT - AUTOMATED BUILD + UPLOAD (versao sem emojis)
# ============================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Write-Host "Entrando no diretorio do projeto..."
Set-Location "E:\HAAKE - 1F627315\DIRETORIOS TRABALHO\E M P R E S A S\.+ENERGIA\PROJETO HIPERAGENTES\Automacoes N8N+SUPABASE+GH\Projetos\AUT - GMN\GMN SmartAudit\BoltNew\Versao 3.0 - 13-10-25\project"

Write-Host "Instalando dependencias..."
npm install

Write-Host "Gerando build de producao..."
npm run build

if (Test-Path "./dist") {
    Write-Host "Build concluido com sucesso!"
} else {
    Write-Host "Erro: pasta dist nao encontrada. Verifique o build."
    exit 1
}

Write-Host "Enviando build para o repositorio remoto..."
if (!(Test-Path ".git")) { git init }
git branch -M main
git remote remove origin -ErrorAction SilentlyContinue
git remote add origin "https://github.com/haake01/GMNSmartLocalAuditor.git"

git add dist -f
$commitMessage = "Deploy automatico - " + (Get-Date -Format "dd/MM/yyyy HH:mm")
git commit -m "$commitMessage"

git subtree push --prefix dist origin gh-pages

Write-Host "Deploy concluido com sucesso!"
Write-Host "Site publicado em: https://haake01.github.io/GMNSmartLocalAuditor/"
Read-Host "Pressione ENTER para sair"
