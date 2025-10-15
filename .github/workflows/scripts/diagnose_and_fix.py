#!/usr/bin/env python3
import os, json, subprocess

def run(cmd):
    """Executa comandos shell com verificação de erro."""
    subprocess.run(cmd, shell=True, check=True)

def ensure_file(path, content):
    """Cria arquivo com conteúdo padrão se não existir."""
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Criado {path}")
        return True
    return False

def fix_page():
    """Garante que exista uma página inicial válida."""
    created = False
    if not os.path.exists("app/page.tsx") and not os.path.exists("pages/index.js"):
        content = 'export default function Page(){return <h1>Hell
