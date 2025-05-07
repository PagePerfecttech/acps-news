// This is a temporary script to update all the menu items in AdminLayout.tsx
// Run this with Node.js

const fs = require('fs');
const path = require('path');

// Path to the AdminLayout.tsx file
const filePath = path.join(__dirname, 'app', 'components', 'AdminLayout.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Define the menu items to update
const menuItems = [
  { href: '/admin/rss', line: 100 },
  { href: '/admin/ads', line: 108 },
  { href: '/admin/comments', line: 116 },
  { href: '/admin/categories', line: 124 },
  { href: '/admin/users', line: 132 },
  { href: '/admin/settings', line: 140 },
];

// Update each menu item
menuItems.forEach(item => {
  const oldStr = `className="flex items-center space-x-2 p-2 rounded-md hover:bg-yellow-400 transition-colors"`;
  const newStr = `className="flex items-center space-x-2 p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: pathname?.startsWith('${item.href}') ? \`\${settings.primary_color}40\` : 'transparent' }}`;
  
  // Find the line in the content
  const lines = content.split('\n');
  if (lines[item.line - 1].includes(oldStr)) {
    lines[item.line - 1] = lines[item.line - 1].replace(oldStr, newStr);
    content = lines.join('\n');
  }
});

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('AdminLayout.tsx updated successfully!');
