export default function IndianMenuPage() {
  const indianMenu = [
    { name: "Butter Chicken", price: 450 },
    { name: "Paneer Tikka", price: 350 },
    { name: "Dal Makhani", price: 300 },
    { name: "Garlic Naan", price: 60 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Indian Menu</h1>
      <div className="grid gap-4">
        {indianMenu.map((item) => (
          <div key={item.name} className="flex justify-between p-4 border rounded">
            <span>{item.name}</span>
            <span>₹{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
