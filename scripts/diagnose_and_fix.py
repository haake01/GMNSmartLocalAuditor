import os
import subprocess
import json

print("🔍 Iniciando diagnóstico do deploy...")

def run(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"⚠️ Erro: {result.stderr}")
    return result.returncode

# Verifica se a pasta dist existe
if not os.path.exists("dist"):
    print("❌ Pasta 'dist' não encontrada. Criando build...")
    run("npm install")
    run("npm run build")
else:
    print("✅ Pasta 'dist' encontrada.")

# Diagnóstico simples do projeto
print("\n📁 Estrutura do diretório atual:")
run("dir" if os.name == "nt" else "ls -la")

# Testa conexão com Vercel CLI
print("\n⚙️ Verificando instalação da Vercel CLI...")
if run("vercel --version") != 0:
    print("⚠️ Vercel CLI não encontrada. Instalando...")
    run("npm install -g vercel")

# Finaliza
print("\n🎯 Diagnóstico e correção concluídos.")

