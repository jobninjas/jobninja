import sys
import os

path = r'c:\Users\vsair\Downloads\novasquar-main\novasquad-main\nova-ninjas\backend\document_generator.py'
if not os.path.exists(path):
    print(f"ERROR: File not found at {path}")
    sys.exit(1)

with open(path, encoding='utf-8') as f:
    src = f.read()

has_list = 'garbage_fragments = [' in src
has_loop = 'for pattern in garbage_fragments:' in src
has_old_list = 'garbage = [' in src

if has_list and has_loop and not has_old_list:
    print('FIXED — garbage_fragments defined and referenced correctly')
elif has_old_list and has_loop:
    print('NOT FIXED — still has: garbage = [ but loop references garbage_fragments')
else:
    print('UNKNOWN STATE')
    # Find the function
    import re
    m = re.search(r'def strip_summary_garbage\(text: str\) -> str:([\s\S]*?)return', src)
    if m:
        print('Function content:\n' + m.group(1).strip()[:1000])
