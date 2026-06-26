import hashlib
import base64
import secrets
import string

def make_password(password, iterations=600000):
    salt = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), iterations)
    hash_b64 = base64.b64encode(dk).decode('ascii').strip()
    return f"pbkdf2_sha256${iterations}${salt}${hash_b64}"

if __name__ == "__main__":
    mdp = "Ivoabdoul1"  # <-- remplace par TON mot de passe
    print(make_password(mdp))