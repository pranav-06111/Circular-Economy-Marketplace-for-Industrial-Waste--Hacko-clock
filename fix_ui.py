import os
import re

files = [
    "src/pages/AiMatcher.tsx",
    "src/pages/BuyerMatches.tsx",
    "src/pages/BuyerOrders.tsx",
    "src/pages/BuyerDashboard.tsx",
    "src/pages/Dashboard.tsx",
    "src/pages/SellerDashboard.tsx",
    "src/pages/Offload.tsx",
    "src/pages/SellerOrders.tsx",
    "src/pages/Login.tsx",
    "src/components/Layout.tsx"
]

def process_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Add disabled state to buttons with loading
    # Find buttons that have onClick and checking if loading exists in file
    if 'loading' in content or 'isLoading' in content:
        # Match buttons that don't have disabled=
        content = re.sub(r'<button([^>]*) onClick=\{([^>]*)\}([^>]*)>', 
                         lambda m: f'<button{m.group(1)} onClick={{{m.group(2)}}}{m.group(3)} disabled={{loading}}>' if 'disabled=' not in m.group(0) and 'loading' in content and 'loading ?' not in m.group(2) else m.group(0), 
                         content)

    # 2. Fix stray shadows
    content = re.sub(r'shadow-[^\s]*emerald[^\s]*', 'shadow-indigo-500/20', content)
    content = re.sub(r'shadow-\[0_4px_[^\]]*emerald[^\]]*\]', 'shadow-sm hover:shadow-md', content)
    
    # 3. Add focus rings to inputs and selects
    # Search for <input className="..." or <select className="..."
    content = re.sub(r'<input([^>]*)className="([^"]*)"([^>]*)>', 
                     lambda m: f'<input{m.group(1)}className="{m.group(2)} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"{m.group(3)}>' if 'focus:ring' not in m.group(2) else m.group(0), 
                     content)
    content = re.sub(r'<select([^>]*)className="([^"]*)"([^>]*)>', 
                     lambda m: f'<select{m.group(1)}className="{m.group(2)} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"{m.group(3)}>' if 'focus:ring' not in m.group(2) else m.group(0), 
                     content)
                     
    # 4. Standardize border radiuses
    # For large containers (often have p-8 or p-12), ensure rounded-2xl
    content = re.sub(r'rounded-3xl', 'rounded-2xl', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for file in files:
    process_file(file)

print("Applied standard UX/UI fixes via script.")
