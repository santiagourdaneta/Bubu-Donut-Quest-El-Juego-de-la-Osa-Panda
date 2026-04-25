import re
import sys

def format_js(file_path):
    try:
        # Abrimos con UTF-8 explícitamente para soportar los emojis de Bubu
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Eliminar espacios al final de las líneas
        content = re.sub(r'[ \t]+$', '', content, flags=re.M)
        # 2. Asegurar que no haya más de dos saltos de línea seguidos
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        # 3. Espacio después de palabras clave (if, for, while, catch)
        content = re.sub(r'\b(if|for|while|catch)\(', r'\1 (', content)
        # 4. Espacio alrededor de operadores de asignación
        content = re.sub(r'(?<![=<>!])=(?![=])', ' = ', content)
        # 5. Limpiar espacios dobles generados por el paso anterior
        content = re.sub(r' +', ' ', content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content.strip() + '\n')
        
        print(f"✅ {file_path} formateado con éxito (UTF-8).")
    except Exception as e:
        print(f"❌ Error al formatear: {e}")
        sys.exit(1)

if __name__ == "__main__":
    format_js('game.js')