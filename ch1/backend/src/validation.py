import base64
import re

CATEGORIES = {"starter", "main", "pasta", "drink", "dessert"}


def validate_products(items):
    if not isinstance(items, list) or len(items) > 500:
        return "商品資料必須為清單，最多 500 件。"
    ids = set()
    for item in items:
        if not isinstance(item, dict):
            return "商品資料格式錯誤。"
        product_id = item.get("id")
        if not isinstance(product_id, str) or not re.fullmatch(r"[a-zA-Z0-9-]{1,100}", product_id) or product_id in ids:
            return "商品識別碼重複或格式錯誤。"
        ids.add(product_id)
        for key, limit, required in [("name", 60, True), ("description", 500, True), ("en", 100, False), ("tag", 20, False), ("allergens", 100, False)]:
            value = item.get(key)
            if not isinstance(value, str) or len(value) > limit or (required and not value.strip()):
                return f"商品欄位 {key} 不符合格式或長度限制。"
        if type(item.get("price")) is not int or not 0 <= item["price"] <= 999999:
            return "請輸入 0–999,999 元的整數價格。"
        if item.get("category") not in CATEGORIES or type(item.get("visible")) is not bool:
            return "商品分類或顯示狀態無效。"
        if "vegetarian" in item and type(item["vegetarian"]) is not bool:
            return "蔬食標記格式錯誤。"
        options = item.get("options", [])
        if not isinstance(options, list) or len(options) > 20 or any(not isinstance(value, str) or len(value) > 50 for value in options):
            return "商品選項格式錯誤。"
        image = item.get("image")
        if not isinstance(image, str) or len(image) > 800000:
            return "商品照片無效或過大。"
        if re.fullmatch(r"[a-zA-Z0-9-]+", image):
            continue
        match = re.fullmatch(r"data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/]+=*)", image)
        if not match:
            return "商品照片格式不正確。"
        try:
            data = base64.b64decode(match[2], validate=True)
            valid = ((match[1] == "jpeg" and data.startswith(b"\xff\xd8\xff")) or
                     (match[1] == "png" and data.startswith(b"\x89PNG\r\n\x1a\n")) or
                     (match[1] == "webp" and data.startswith(b"RIFF") and data[8:12] == b"WEBP"))
            if not valid:
                return "商品照片內容與格式不符。"
        except ValueError:
            return "商品照片無法解碼。"
    return None
