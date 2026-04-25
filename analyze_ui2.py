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

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, 'r') as f:
        content = f.read()

    print(f"\n--- {file} ---")

    # Check empty states
    if 'filtered.length === 0' in content or 'matches.length === 0' in content or 'orders.length === 0' in content:
        print("Empty state exists")
    elif 'map(' in content and '.length === 0' not in content:
        print("WARNING: Might be missing empty state for arrays mapped")

    # Check loading
    if 'loading ?' in content or 'isLoading ?' in content:
        print("Loading state exists")
    else:
        print("WARNING: Missing loading state check")

    # Check button disabled
    btns = re.findall(r'<button[^>]*>', content)
    disabled_count = sum(1 for b in btns if 'disabled' in b)
    print(f"Buttons: {len(btns)}, Disabled capable: {disabled_count}")

    # Find raw emerald shadows that were missed in theme refactor
    emerald_shadows = re.findall(r'shadow-[^\s]*emerald[^\s]*', content)
    if emerald_shadows:
        print("Emerald shadows found:", emerald_shadows)
        
    emerald_classes = re.findall(r'[^\s]*emerald[^\s]*', content)
    if len(emerald_classes) > 0:
        # filter out the intentional eco-ones?
        pass

