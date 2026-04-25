import os
import re
from collections import Counter

src_dir = 'src'
tsx_files = []
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx'):
            tsx_files.append(os.path.join(root, file))

class_counter = Counter()

# Common issues: missing focus states, disabled states, inconsistent rounding
issues = []

for file in tsx_files:
    with open(file, 'r') as f:
        content = f.read()
        
    # Find all class names
    classes = re.findall(r'className="([^"]+)"', content)
    classes += re.findall(r'className={`([^`]+)`}', content)
    
    for cls_str in classes:
        # split by space and strip
        cls_list = [c.strip() for c in cls_str.split() if c.strip()]
        class_counter.update(cls_list)
        
        # Check specific rules
        # If it's a button, check if it has disabled state or focus state
        if 'hover:' in cls_str and 'transition' not in cls_str:
             # Just a mental check, transition is good to have.
             pass
             
    # Look for button elements without disabled states if they have onClick/onSubmit
    button_tags = re.findall(r'<button[^>]*>', content)
    for btn in button_tags:
        if 'disabled=' not in btn and 'onClick' in btn:
            # check if loading state exists nearby or if it should be disabled
            pass

print("Top 10 classes:")
for c, count in class_counter.most_common(10):
    print(f"{c}: {count}")

# Let's count rounding usages
roundings = [c for c in class_counter if c.startswith('rounded-')]
print("\nRounding usages:")
for r in roundings:
    print(f"{r}: {class_counter[r]}")

# Shadows
shadows = [c for c in class_counter if c.startswith('shadow-')]
print("\nShadow usages:")
for s in shadows:
    print(f"{s}: {class_counter[s]}")

