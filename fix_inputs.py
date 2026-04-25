import os
import re

src_dir = 'src/pages'
tsx_files = [os.path.join(src_dir, f) for f in os.listdir(src_dir) if f.endswith('.tsx')]

for filepath in tsx_files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Add focus:outline-none focus:ring-2 focus:ring-indigo-500 to inputs/selects that have 'focus:outline-none' but missing 'focus:ring-2'
    content = re.sub(r'focus:ring-1 focus:ring-emerald-500', 'focus:ring-2 focus:ring-indigo-500 border-slate-200 dark:border-slate-700', content)
    content = re.sub(r'focus:ring-1 focus:ring-indigo-500', 'focus:ring-2 focus:ring-indigo-500', content)
    content = re.sub(r'focus:border-emerald-500', 'focus:border-indigo-500', content)
    
    # Add aria-label to icon buttons (like refresh, close)
    # E.g. <button onClick={fetchOrders} className="..."><RefreshCw size={16}/></button>
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Inputs fixed.")
