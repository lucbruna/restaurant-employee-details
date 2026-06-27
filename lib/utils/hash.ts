export function getAvatarColor(name: string): string {
  const colors = [
    '#FF6B35', '#38B2AC', '#48BB78', '#F6AD55', '#63B3ED', 
    '#9F7AEA', '#ED64A6', '#F56565', '#ECC94B', '#4299E1'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
