import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routers.auth import pwd_ctx
import traceback

def test():
    try:
        pw = "admin123"
        print(f"Hashing pw of type {type(pw)} and length {len(pw)}")
        res = pwd_ctx.hash(pw)
        print("Success:", res)
    except Exception as e:
        traceback.print_exc()

test()
