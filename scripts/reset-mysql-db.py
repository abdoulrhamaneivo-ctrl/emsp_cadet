#!/usr/bin/env python3
"""Reinitialise les tables Django dans la base MySQL configuree (.env)."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "aine-cadet"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from dotenv import load_dotenv

load_dotenv(ROOT / "aine-cadet" / ".env")

try:
    import pymysql
except ImportError:
    print("ERREUR: PyMySQL non installe")
    sys.exit(1)


def main() -> int:
    db_name = os.getenv("DB_NAME", "emspconnect")
    print(f"Reinitialisation des tables dans `{db_name}` ...")

    conn = pymysql.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        port=int(os.getenv("DB_PORT", "3306")),
        database=db_name,
    )
    cur = conn.cursor()
    cur.execute("SET FOREIGN_KEY_CHECKS=0")
    cur.execute("SHOW TABLES")
    tables = [row[0] for row in cur.fetchall()]
    for table in tables:
        cur.execute(f"DROP TABLE IF EXISTS `{table}`")
    cur.execute("SET FOREIGN_KEY_CHECKS=1")
    conn.commit()
    conn.close()
    print(f"OK: {len(tables)} table(s) supprimee(s). Relancez .\\scripts\\setup-mysql.ps1")
    return 0


if __name__ == "__main__":
    sys.exit(main())
