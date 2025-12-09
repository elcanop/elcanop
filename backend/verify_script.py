import requests
import fitz
import json
import os

# 1. Create a dummy PDF
doc = fitz.open()
page = doc.new_page()
page.insert_text((50, 50), "Hola Mundo. Este es un texto de prueba.", fontsize=12)
doc.save("test_verify.pdf")
doc.close()

print("Created test_verify.pdf")

# 2. Upload PDF
url_upload = "http://localhost:8000/api/upload"
files = {'file': open('test_verify.pdf', 'rb')}
response = requests.post(url_upload, files=files)

if response.status_code != 200:
    print(f"Upload failed: {response.text}")
    exit(1)

data = response.json()
print("Upload successful. File ID:", data['file_id'])
print("Number of text blocks:", len(data['text_blocks']))

if not data['text_blocks']:
    print("No text blocks found!")
    exit(1)

# 3. Modify text
# Find the block with "Hola Mundo"
target_block_idx = 0
original_block = data['text_blocks'][0]
print(f"Original text: '{original_block['text']}'")

edits = [{
    "rect": original_block['rect'],
    "new_text": "Editado exitosamente.",
    "original_text": original_block['text'],
    "size": original_block['size'],
    "color": original_block['color']
}]

# 4. Save PDF
url_save = "http://localhost:8000/api/save"
save_payload = {
    "file_id": data['file_id'],
    "edits": edits
}

response_save = requests.post(url_save, json=save_payload)

if response_save.status_code != 200:
    print(f"Save failed: {response_save.text}")
    exit(1)

with open("result_verify.pdf", "wb") as f:
    f.write(response_save.content)

print("Saved result_verify.pdf")

# 5. Verify Content of Result
doc_res = fitz.open("result_verify.pdf")
page_res = doc_res[0]
text_res = page_res.get_text()
print("Result text content:", text_res.strip())

if "Editado exitosamente" in text_res:
    print("VERIFICATION PASSED: New text found.")
else:
    print("VERIFICATION FAILED: New text not found.")

if "Hola Mundo" not in text_res:
    print("VERIFICATION PASSED: Old text removed.")
else:
    print("VERIFICATION FAILED: Old text still present.")
