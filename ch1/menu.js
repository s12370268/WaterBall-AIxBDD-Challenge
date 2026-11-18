export const categories = [ ['all', '所有餐點', 'All dishes'], ['starter', '開胃小點', 'To start'], ['main', '主廚料理', 'Main course'], ['pasta', '義麵・燉飯', 'Pasta & risotto'], ['drink', '微醺時光', 'Drinks'], ['dessert', '甜蜜收尾', 'Dessert'] ];
export const menu = [
  { id: 'burrata', category: 'starter', name: '酪梨與季節田園沙拉', en: 'Avocado & Garden Salad', description: '綿密酪梨、甜烤南瓜與繽紛鮮蔬，搭配鷹嘴豆與優格醬，讓清爽滋味喚醒味蕾。', price: 320, image: 'burrata', tag: '主廚推薦', allergens: '奶製品', vegetarian: true },
  { id: 'steak', category: 'main', name: '炭烤美國肋眼牛排', en: 'Chargrilled Ribeye Steak', description: '精選美國肋眼，以炭火鎖住豐潤肉汁，搭配烤時蔬、迷迭香與紅酒醬汁。', price: 980, image: 'steak', tag: '人氣必點', allergens: '奶製品', options: ['五分熟', '三分熟', '七分熟', '全熟'] },
  { id: 'pasta', category: 'pasta', name: '羅勒青醬蝴蝶麵', en: 'Basil Pesto Farfalle', description: '新鮮羅勒與堅果打成濃郁青醬，蝴蝶麵裹上醬汁，搭配番茄與帕瑪森起司。', price: 420, image: 'pasta', tag: '', allergens: '奶製品、麩質、堅果', vegetarian: true },
  { id: 'shrimp', category: 'starter', name: '鮭魚酪梨塔塔', en: 'Salmon & Avocado Tartare', description: '細切鮭魚與綿密酪梨層層堆疊，點綴晶瑩鮭魚卵，品嚐清新細緻的滋味。', price: 360, image: 'shrimp', tag: '', allergens: '魚類、蛋' },
  { id: 'salmon', category: 'main', name: '香煎鮭魚佐檸檬奶油', en: 'Pan-seared Salmon', description: '酥脆魚皮與細嫩鮭魚，搭配季節蔬菜及清新檸檬奶油醬。', price: 560, image: 'salmon', tag: '', allergens: '魚類、奶製品' },
  { id: 'risotto', category: 'pasta', name: '松露野菇帕瑪森燉飯', en: 'Truffle & Parmesan Risotto', description: '義大利米慢火吸收濃郁高湯與松露香氣，拌入野菇，刨上帕瑪森起司薄片。', price: 480, image: 'risotto', tag: '主廚推薦', allergens: '奶製品' },
  { id: 'cocktail', category: 'drink', name: '森暮特調・柚見你', en: 'MORI Signature Cocktail', description: '琴酒與柚子清香，揉合接骨木花和氣泡，獻給放慢步調的夜晚。含酒精。', price: 320, image: 'cocktail', tag: '招牌特調', allergens: '含酒精', options: ['正常冰', '少冰'] },
  { id: 'tea', category: 'drink', name: '白桃烏龍氣泡飲', en: 'Peach Oolong Sparkler', description: '白桃果香、清焙烏龍與細緻氣泡，無酒精也能擁有微醺般的好心情。', price: 180, image: 'tea', tag: '無酒精', allergens: '無', options: ['正常冰', '少冰'] },
  { id: 'tiramisu', category: 'dessert', name: '經典手作提拉米蘇', en: 'Homemade Tiramisu', description: '濃縮咖啡浸潤手指餅乾，層疊馬斯卡彭奶霜與可可粉，為今晚留下甜美餘韻。', price: 220, image: 'tiramisu', tag: '', allergens: '奶製品、麩質、蛋、咖啡因' }
];
export const money = n => new Intl.NumberFormat('zh-TW').format(n);
export function totals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const service = Math.round(subtotal * 0.1);
  return { subtotal, service, total: subtotal + service, count: items.reduce((sum, item) => sum + item.quantity, 0) };
}
export function makeLine(item, quantity, option, note) {
  return { key: JSON.stringify([item.id, option, note.trim()]), id: item.id, name: item.name, price: item.price, image: item.image, quantity, option, note: note.trim() };
}
