#!/bin/bash

# Script to replace hardcoded colors with theme-aware Tailwind classes
# This helps ensure all 3 global themes work across all pages

echo "Fixing theme colors in public pages..."

# Define the files to fix
FILES=(
  "packages/frontend/src/pages/public/HomePage.jsx"
  "packages/frontend/src/pages/public/FeaturesPage.jsx"
  "packages/frontend/src/pages/public/PublicClassesPage.jsx"
  "packages/frontend/src/pages/public/PublicTrainersPage.jsx"
  "packages/frontend/src/pages/public/PublicMembershipsPage.jsx"
  "packages/frontend/src/pages/public/PublicWorkoutPlansPage.jsx"
)

# Color replacements
declare -A replacements=(
  ["bg-\[#22c55e\]"]="bg-primary"
  ["text-\[#22c55e\]"]="text-primary"
  ["border-\[#22c55e\]"]="border-primary"
  ["hover:bg-\[#22c55e\]"]="hover:bg-primary"
  ["hover:text-\[#22c55e\]"]="hover:text-primary"
  ["from-\[#22c55e\]"]="from-primary"
  ["to-\[#84cc16\]"]="to-accent"
  ["bg-\[#84cc16\]"]="bg-accent"
  ["hover:bg-\[#84cc16\]"]="hover:bg-accent"
  ["bg-\[#171717\]"]="bg-dark-surface"
  ["bg-\[#0a0a0a\]"]="bg-dark"
  ["border-\[#22c55e\]/20"]="border-primary/20"
  ["hover:border-\[#22c55e\]/20"]="hover:border-primary/20"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    for old in "${!replacements[@]}"; do
      new="${replacements[$old]}"
      # Use perl for more reliable regex replacement
      perl -i -pe "s/$old/$new/g" "$file"
    done
  fi
done

echo "Done! Theme colors have been updated."
echo "Note: Some complex patterns may need manual review."
