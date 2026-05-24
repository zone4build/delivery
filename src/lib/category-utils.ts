export interface CategoryIcon {
  id: string;
  name: string;
  icon: string; // Emoji or SVG path
  color: string;
}

export const SHOP_CATEGORIES: CategoryIcon[] = [
  { id: '585', name: 'Food & Restaurant', icon: '🍕', color: '#FF5733' }, // Updated ID to 585
  { id: '2', name: 'Beauty', icon: '✂️', color: '#C70039' },
  { id: '3', name: 'Services', icon: '🛠️', color: '#900C3F' },
  { id: '4', name: 'Clothing', icon: '👟', color: '#581845' },
  { id: '5', name: 'Electronics', icon: '💻', color: '#2E86C1' },
  { id: '6', name: 'Health', icon: '🏥', color: '#28B463' },
  { id: '7', name: 'Grocery', icon: '🛒', color: '#F1C40F' },
];

export function getCategoryIcon(categoryId?: string) {
  // Alias common categories for better mapping
  const id = (categoryId === 'food' || categoryId === 'food-restaurant') ? '585' : categoryId;
  
  return SHOP_CATEGORIES.find((cat) => cat.id === id) || {
    id: 'other',
    name: 'Other',
    icon: '🏠',
    color: '#00c59a',
  };
}
