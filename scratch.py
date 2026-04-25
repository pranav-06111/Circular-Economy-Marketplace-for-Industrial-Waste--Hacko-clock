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
    "src/pages/LandingPage.tsx"
]

def replace_in_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r") as f:
        content = f.read()

    # Buttons: bg-emerald-500 -> bg-gradient-to-r from-indigo-600 to-purple-600
    # Wait, some buttons are flat bg-emerald-500. Some are bg-gradient-to-r from-emerald-500 to-green-500.
    
    # 1. Primary Button gradient replacement (AiMatcher, BuyerMatches, BuyerOrders)
    content = content.replace("bg-gradient-to-r from-emerald-500 to-green-500", "bg-gradient-to-r from-indigo-600 to-purple-600")
    content = content.replace("from-emerald-500 to-green-500", "from-indigo-600 to-purple-600")
    
    # 2. Score rings: score >= 90 ? 'emerald' -> 'purple'
    content = content.replace("theme === 'emerald'", "theme === 'purple'")
    content = content.replace("theme === 'sky'", "theme === 'blue'")
    # We must be careful replacing 'emerald' string literal without affecting imports.
    content = re.sub(r"score >= 90 \? 'emerald'", "score >= 90 ? 'purple'", content)
    content = re.sub(r"score >= 80 \? 'sky'", "score >= 80 ? 'blue'", content)
    
    # Text colors for match scores
    content = content.replace("text-emerald-500", "text-purple-500") # Need to restore specific ones later
    content = content.replace("text-emerald-600 border-emerald-100", "text-purple-600 border-purple-100")
    content = content.replace("border-emerald-100 dark:border-emerald-500/20", "border-purple-100 dark:border-purple-500/20")
    
    # Active tabs/buttons that use emerald
    content = content.replace("bg-emerald-500 text-white", "bg-indigo-600 text-white")
    content = content.replace("bg-emerald-500 hover:bg-emerald-600", "bg-indigo-600 hover:bg-indigo-700")

    # Restore eco-icons and metrics to emerald
    content = content.replace("<Leaf className=\"text-purple-500\"", "<Leaf className=\"text-emerald-500\"")
    content = content.replace("<Leaf size={16} className=\"mr-1.5 text-purple-500\"/>", "<Leaf size={16} className=\"mr-1.5 text-emerald-500\"/>")
    content = content.replace("<Leaf size={14} className=\"mr-1.5 text-purple-400\"/>", "<Leaf size={14} className=\"mr-1.5 text-emerald-400\"/>")
    content = content.replace("<Leaf size={12} className=\"mr-1 text-purple-500\"/>", "<Leaf size={12} className=\"mr-1 text-emerald-500\"/>")
    content = content.replace("<Leaf size={12} className=\"mr-1.5 text-purple-500\"/>", "<Leaf size={12} className=\"mr-1.5 text-emerald-500\"/>")
    content = content.replace("<Leaf size={24} className=\"text-purple-500\" />", "<Leaf size={24} className=\"text-emerald-500\" />")
    content = content.replace("<Leaf size={20} className=\"text-purple-500\"", "<Leaf size={20} className=\"text-emerald-500\"")
    content = content.replace("<Leaf size={40} className=\"mx-auto text-purple-500", "<Leaf size={40} className=\"mx-auto text-emerald-500")
    
    # Restore CO2 specific text to emerald
    content = content.replace("text-purple-600 dark:text-purple-400\">14.2K", "text-emerald-600 dark:text-emerald-400\">14.2K")
    content = content.replace("text-purple-600 dark:text-purple-400\">2,341", "text-emerald-600 dark:text-emerald-400\">2,341")
    
    # Top Matches / Insights icons
    content = content.replace("<Zap className=\"text-purple-500\"", "<Zap className=\"text-indigo-500\"")
    content = content.replace("<Activity className=\"text-purple-500\"", "<Activity className=\"text-indigo-500\"")
    content = content.replace("<TrendingUp size={20} className=\"text-purple-500\"", "<TrendingUp size={20} className=\"text-indigo-500\"")
    content = content.replace("<Package className=\"text-purple-500\"", "<Package className=\"text-indigo-500\"")

    with open(filepath, "w") as f:
        f.write(content)

for file in files:
    replace_in_file(file)

print("Applied global replacements")
