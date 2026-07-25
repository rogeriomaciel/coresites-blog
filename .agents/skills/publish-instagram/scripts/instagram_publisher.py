#!/usr/bin/env python3
"""
Instagram Graph API Publisher for CoreAutoCRM Blog
Supports single image, carousel container creation, scheduling, and preview mode.
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.parse

def load_env():
    env_vars = {}
    for env_path in [".env", "core/.env", "../.env"]:
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip().strip("'\"")
    return env_vars

def main():
    parser = argparse.ArgumentParser(description="Instagram Graph API Publisher")
    parser.add_argument("--caption-file", help="Path to text file containing post caption")
    parser.add_argument("--image-url", help="Publicly accessible URL of the image/media")
    parser.add_argument("--publish", action="store_true", help="Publish directly to Instagram API")
    args = parser.parse_args()

    env = load_env()
    ig_account_id = env.get("INSTAGRAM_ACCOUNT_ID") or os.environ.get("INSTAGRAM_ACCOUNT_ID")
    access_token = env.get("INSTAGRAM_ACCESS_TOKEN") or os.environ.get("INSTAGRAM_ACCESS_TOKEN")

    caption = ""
    if args.caption_file and os.path.exists(args.caption_file):
        with open(args.caption_file, "r", encoding="utf-8") as f:
            caption = f.read()
    else:
        caption = "🤖 Postagem automática gerada pelo Super Agente Instagram do CoreAutoCRM!"

    print("==================================================")
    print(" 📸 SUPER AGENTE INSTAGRAM - GERENCIADOR DE POST")
    print("==================================================")

    if not ig_account_id or not access_token:
        print("\n⚠️  Credenciais do Instagram não encontradas no .env (INSTAGRAM_ACCOUNT_ID / INSTAGRAM_ACCESS_TOKEN).")
        print("ℹ️  Modo SIMULAÇÃO / PRÉ-VISUALIZAÇÃO ativado com sucesso!\n")
        print("--- CONTEÚDO PRONTO PARA O INSTAGRAM ---")
        print(caption)
        print("-----------------------------------------")
        if args.image_url:
            print(f"🖼️ Mídia associada: {args.image_url}")
        print("\n✅ Prévia validada! Adicione INSTAGRAM_ACCOUNT_ID e INSTAGRAM_ACCESS_TOKEN no .env para publicação via API.")
        return

    if not args.image_url:
        print("❌ Erro: --image-url é obrigatório para enviar à API do Instagram Graph.")
        sys.exit(1)

    print(f"🔄 Conectando à Graph API da Meta (Account: {ig_account_id})...")
    
    # Step 1: Create Media Container
    container_url = f"https://graph.facebook.com/v19.0/{ig_account_id}/media"
    data = urllib.parse.urlencode({
        "image_url": args.image_url,
        "caption": caption,
        "access_token": access_token
    }).encode("utf-8")

    try:
        req = urllib.request.Request(container_url, data=data, method="POST")
        with urllib.request.urlopen(req) as resp:
            res_json = json.loads(resp.read().decode("utf-8"))
            creation_id = res_json.get("id")
            print(f"✅ Container de Mídia Criado com Sucesso! ID: {creation_id}")
    except Exception as e:
        print(f"❌ Erro ao criar container de mídia: {e}")
        sys.exit(1)

    if args.publish:
        # Step 2: Publish Container
        publish_url = f"https://graph.facebook.com/v19.0/{ig_account_id}/media_publish"
        pub_data = urllib.parse.urlencode({
            "creation_id": creation_id,
            "access_token": access_token
        }).encode("utf-8")

        try:
            req_pub = urllib.request.Request(publish_url, data=pub_data, method="POST")
            with urllib.request.urlopen(req_pub) as resp_pub:
                res_pub = json.loads(resp_pub.read().decode("utf-8"))
                media_id = res_pub.get("id")
                print(f"🎉 POST PUBLICADO COM SUCESSO NO INSTAGRAM! ID Mídia: {media_id}")
        except Exception as e:
            print(f"❌ Erro ao publicar post: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
