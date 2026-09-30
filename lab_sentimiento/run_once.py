from transformers import pipeline
clf = pipeline("text-classification", model="nlptown/bert-base-multilingual-uncased-sentiment")

result = clf("El envio llego rapido y en buen estado")
print(result)