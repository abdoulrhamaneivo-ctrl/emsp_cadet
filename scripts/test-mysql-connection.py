#!/usr/bin/env python3
"""Test connexion MySQL pour setup-mysql.ps1 — ne pas lancer directement."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / "aine-cadet" / ".env"

try:
    from dotenv import load_dotenv
except ImportError:
    print("SKIP: python-dotenv non installe")
    sys.exit(0)

load_dotenv(ENV_FILE)

try:
    import pymysql
except ImportError:
    print("SKIP: PyMySQL non installe — pip install PyMySQL")
    sys.exit(0)

host = os.getenv("DB_HOST", "127.0.0.1")
port = int(os.getenv("DB_PORT", "3306"))
user = os.getenv("DB_USER", "root")
password = os.getenv("DB_PASSWORD", "")
db_name = os.getenv("DB_NAME", "emspconnect")


def parse_version(version_str: str) -> tuple:
    parts = version_str.split("-")[0].split(".")
    out = []
    for p in parts[:3]:
        if p.isdigit():
            out.append(int(p))
    while len(out) < 3:
        out.append(0)
    return tuple(out)


def main() -> int:
    try:
        conn = pymysql.connect(
            host=host,
            user=user,
            password=password,
            port=port,
            connect_timeout=8,
        )
        cur = conn.cursor()
        cur.execute("SELECT VERSION()")
        version = cur.fetchone()[0]
        lower = version.lower()

        if "mariadb" in lower:
            ver = parse_version(version.split("-")[0])
            if ver < (10, 5, 0):
                print(
                    f"WARN: MariaDB {version} — Django 5 exige 10.5+ officiellement. "
                    "Pour XAMPP 10.4 : ajoutez MYSQL_ALLOW_LEGACY=1 dans .env (dev local)."
                )
                return 3
        else:
            ver = parse_version(version)
            if ver < (8, 0, 0):
                print(f"FAIL: MySQL {version} — Django 5 exige MySQL 8.0+")
                return 2

        cur.execute("SHOW DATABASES LIKE %s", (db_name,))
        if cur.fetchone():
            print(f"OK: serveur {version} accessible, base '{db_name}' trouvee")
        else:
            print(f"WARN: serveur {version} accessible mais base '{db_name}' absente")
            print(
                f"SQL: CREATE DATABASE {db_name} "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
        conn.close()
        return 0
    except Exception as exc:
        print(f"WARN: connexion MySQL impossible — {exc}")
        print("Verifiez que MySQL est demarre et DB_USER/DB_PASSWORD dans aine-cadet/.env")
        return 1


if __name__ == "__main__":
    sys.exit(main())
